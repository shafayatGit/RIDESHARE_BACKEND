import status from "http-status";
import AppError from "../../errors/AppError";
import { AccountStatus, RideStatus } from "../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { envVars } from "../../config/env";
import { routeDistanceInMiles } from "../../utils/distance";
import { ICreateRide, IEstimateRide, IRideEstimate, IUpdateRide } from "./ride.interface";

const ensureActiveDriver = async (userId: string) => {
  const driver = await prisma.user.findUnique({ where: { id: userId } });

  if (
    !driver ||
    driver.isDeleted ||
    driver.accountStatus === AccountStatus.DEACTIVATED
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to perform this action",
    );
  }
};

const ensureOwnVehicle = async (vehicleId: string, userId: string) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });

  if (!vehicle || vehicle.ownerId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to use this vehicle",
    );
  }

  return vehicle;
};

const getOwnRide = async (rideId: string, userId: string) => {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });

  if (!ride) {
    throw new AppError(status.NOT_FOUND, "Ride not found");
  }

  if (ride.driverId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to modify this ride",
    );
  }

  return ride;
};

const createRide = async (payload: ICreateRide, user: IRequestUser) => {
  await ensureActiveDriver(user.id);
  const vehicle = await ensureOwnVehicle(payload.vehicleId, user.id);

  const checkpoints = (payload.checkpoints ?? []).map((checkpoint, index) => ({
    ...checkpoint,
    sequenceOrder: checkpoint.sequenceOrder ?? index + 1,
  }));

  // The ride and its checkpoints are written in a single transaction, so a
  // failure anywhere (bad checkpoint, constraint violation, dropped connection)
  // rolls the whole thing back. A ride is therefore never left in the database
  // without the route it was created with.
  const ride = await prisma.$transaction(async (tx) => {
    const createdRide = await tx.ride.create({
      data: {
        driverId: user.id,
        vehicleId: vehicle.id,
        originAddress: payload.originAddress,
        originLat: payload.originLat,
        originLng: payload.originLng,
        destinationAddress: payload.destinationAddress,
        destinationLat: payload.destinationLat,
        destinationLng: payload.destinationLng,
        departureTime: payload.departureTime,
        totalSeats: payload.totalSeats,
        availableSeats: payload.totalSeats,
        pricePerSeat: payload.pricePerSeat,
        isFemaleOnly: payload.isFemaleOnly,
      },
    });

    if (checkpoints.length > 0) {
      await tx.rideCheckpoint.createMany({
        data: checkpoints.map((checkpoint) => ({
          rideId: createdRide.id,
          type: checkpoint.type,
          address: checkpoint.address,
          lat: checkpoint.lat,
          lng: checkpoint.lng,
          sequenceOrder: checkpoint.sequenceOrder,
          estimatedTime: checkpoint.estimatedTime,
        })),
      });
    }

    return createdRide;
  });

  return ride;
};

const getRideById = async (id: string) => {
  const ride = await prisma.ride.findUnique({
    where: { id },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          image: true,
          avgRatingAsDriver: true,
          ratingCount: true,
        },
      },
      vehicle: true,
      checkpoints: { orderBy: { sequenceOrder: "asc" } },
    },
  });

  if (!ride) {
    throw new AppError(status.NOT_FOUND, "Ride not found");
  }

  return ride;
};

const getAllRides = async () => {
  return prisma.ride.findMany({
    where: {
      status: { notIn: [RideStatus.CANCELLED, RideStatus.COMPLETED] },
      availableSeats: { gt: 0 },
    },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          image: true,
          avgRatingAsDriver: true,
          ratingCount: true,
        },
      },
      vehicle: true,
      checkpoints: { orderBy: { sequenceOrder: "asc" } },
    },
    orderBy: { departureTime: "asc" },
  });
};

/**
 * Full history of rides offered by the signed-in driver: completed and
 * cancelled ones included, and regardless of remaining seats.
 * `getAllRides` hides fully booked and finished rides because they cannot be
 * booked, but a driver must see their whole record on their profile.
 */
const getMyRides = async (userId: string) => {
  return prisma.ride.findMany({
    where: { driverId: userId },
    include: {
      vehicle: true,
      checkpoints: { orderBy: { sequenceOrder: "asc" } },
      bookings: {
        select: {
          id: true,
          status: true,
          seatsBooked: true,
          costShareAmount: true,
          passenger: { select: { id: true, name: true, image: true } },
        },
      },
    },
    orderBy: { departureTime: "desc" },
  });
};

const updateRide = async (
  id: string,
  payload: IUpdateRide,
  user: IRequestUser,
) => {
  await ensureActiveDriver(user.id);
  const ride = await getOwnRide(id, user.id);

  if (payload.vehicleId) {
    await ensureOwnVehicle(payload.vehicleId, user.id);
  }

  const updatedRide = await prisma.ride.update({
    where: { id: ride.id },
    data: payload,
  });

  return updatedRide;
};

const deleteRide = async (id: string, user: IRequestUser) => {
  await ensureActiveDriver(user.id);
  const ride = await getOwnRide(id, user.id);

  if (ride.status !== RideStatus.SCHEDULED) {
    throw new AppError(
      status.BAD_REQUEST,
      "Only scheduled rides can be deleted",
    );
  }

  await prisma.ride.delete({ where: { id: ride.id } });

  return ride;
};

const estimateRidePrice = async (
  payload: IEstimateRide,
): Promise<IRideEstimate> => {
  // Build the route points in order: origin -> stops -> destination. Each is
  // required to be present so the distance matches what the frontend just drew.
  const points = [
    { lat: payload.originLat, lng: payload.originLng },
    ...(payload.stops ?? []).map((s) => ({ lat: s.lat, lng: s.lng })),
    { lat: payload.destinationLat, lng: payload.destinationLng },
  ];

  const distanceMiles = routeDistanceInMiles(points);

  const totalRideCount = await prisma.ride.count();
  if (totalRideCount === 0) {
    const ratePerMile = envVars.COST_PER_MILE;
    const suggestedPricePerSeat = Number((distanceMiles * ratePerMile).toFixed(2));

    return {
      distanceMiles,
      ratePerMile,
      rateSource: "DEFAULT_PER_MILE",
      sampleRideCount: 0,
      suggestedPricePerSeat: suggestedPricePerSeat < 0 ? 0 : suggestedPricePerSeat,
    };
  }

  // Derive the average price per mile across ALL existing rides (including
  // those that may be completed/cancelled in history). The frontend's "Cost
  // Calculator" is a quick ballpark; using historical offered prices keeps the
  // suggestion consistent with what drivers have actually charged previously.
  const ridePriceData = await prisma.ride.findMany({
    select: {
      pricePerSeat: true,
      totalSeats: true,
    },
  });

  const pricePerMileSamples = ridePriceData
    .filter((r) => r.totalSeats > 0)
    .map((r) => {
      // Prisma Decimal -> number for averaging; precision 2 is fine for
      // per-mile rates in this domain.
      const pricePerSeat = Number(r.pricePerSeat);
      const effectivePricePerSeat =
        pricePerSeat < 0 ? 0 : pricePerSeat;
      return effectivePricePerSeat / r.totalSeats;
    })
    .filter((v) => Number.isFinite(v) && v >= 0);

  const avgPricePerMile =
    pricePerMileSamples.length > 0
      ? pricePerMileSamples.reduce((sum, v) => sum + v, 0) / pricePerMileSamples.length
      : envVars.COST_PER_MILE;

  const ratePerMile = avgPricePerMile <= 0 ? envVars.COST_PER_MILE : avgPricePerMile;
  const suggestedPricePerSeat = Number((distanceMiles * ratePerMile).toFixed(2));

  return {
    distanceMiles,
    ratePerMile,
    rateSource: "RIDE_AVERAGE",
    sampleRideCount: pricePerMileSamples.length,
    suggestedPricePerSeat: suggestedPricePerSeat < 0 ? 0 : suggestedPricePerSeat,
  };
};

export const rideService = {
  createRide,
  getRideById,
  getAllRides,
  getMyRides,
  updateRide,
  deleteRide,
  estimateRidePrice,
};
