import status from "http-status";
import AppError from "../../errors/AppError";
import { AccountStatus, RideStatus } from "../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateRide, IUpdateRide } from "./ride.interface";

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

  const ride = await prisma.ride.create({
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

  return ride;
};

const getRideById = async (id: string) => {
  const ride = await prisma.ride.findUnique({
    where: { id },
    include: {
      driver: {
        select: { id: true, name: true, image: true, avgRatingAsDriver: true },
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
        select: { id: true, name: true, image: true, avgRatingAsDriver: true },
      },
      vehicle: true,
      checkpoints: { orderBy: { sequenceOrder: "asc" } },
    },
    orderBy: { departureTime: "asc" },
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

export const rideService = {
  createRide,
  getRideById,
  getAllRides,
  updateRide,
  deleteRide,
};
