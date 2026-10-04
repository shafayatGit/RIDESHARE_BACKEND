import status from "http-status";
import AppError from "../../errors/AppError";
import {
  AccountStatus,
  BookingStatus,
  Gender,
  RideStatus,
} from "../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICancelBooking, ICreateBooking } from "./booking.interface";

const createBooking = async (payload: ICreateBooking, user: IRequestUser) => {
  const passenger = await prisma.user.findUnique({ where: { id: user.id } });
  if (!passenger || passenger.isDeleted || passenger.accountStatus === AccountStatus.DEACTIVATED) {
    throw new AppError(status.FORBIDDEN, "You are not allowed to perform this action");
  }

  const ride = await prisma.ride.findUnique({ where: { id: payload.rideId } });
  if (!ride) {
    throw new AppError(status.NOT_FOUND, "Ride not found");
  }

  if (ride.status !== RideStatus.SCHEDULED) {
    throw new AppError(status.BAD_REQUEST, "Ride is not available for booking");
  }

  if (ride.driverId === user.id) {
    throw new AppError(status.BAD_REQUEST, "You cannot book your own ride");
  }

  if (ride.isFemaleOnly && passenger.gender !== Gender.FEMALE) {
    throw new AppError(status.FORBIDDEN, "This ride is only available for female passengers");
  }

  if (payload.seatsBooked > ride.availableSeats) {
    throw new AppError(status.BAD_REQUEST, "Not enough seats available");
  }

  const [pickupCheckpoint, dropCheckpoint] = await Promise.all([
    prisma.rideCheckpoint.findUnique({ where: { id: payload.pickupCheckpointId } }),
    prisma.rideCheckpoint.findUnique({ where: { id: payload.dropCheckpointId } }),
  ]);

  if (!pickupCheckpoint || pickupCheckpoint.rideId !== ride.id) {
    throw new AppError(status.BAD_REQUEST, "Invalid pickup checkpoint for this ride");
  }
  if (!dropCheckpoint || dropCheckpoint.rideId !== ride.id) {
    throw new AppError(status.BAD_REQUEST, "Invalid drop checkpoint for this ride");
  }
  if (pickupCheckpoint.sequenceOrder >= dropCheckpoint.sequenceOrder) {
    throw new AppError(status.BAD_REQUEST, "Pickup checkpoint must come before drop checkpoint");
  }

  const existingBooking = await prisma.booking.findFirst({
    where: {
      rideId: ride.id,
      passengerId: user.id,
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
    },
  });
  if (existingBooking) {
    throw new AppError(status.CONFLICT, "You already have an active booking for this ride");
  }

  const costShareAmount = Number(ride.pricePerSeat) * payload.seatsBooked;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.ride.updateMany({
      where: {
        id: ride.id,
        status: RideStatus.SCHEDULED,
        availableSeats: { gte: payload.seatsBooked },
      },
      data: { availableSeats: { decrement: payload.seatsBooked } },
    });

    if (updated.count === 0) {
      throw new AppError(status.CONFLICT, "No seats available");
    }

    return tx.booking.create({
      data: {
        rideId: ride.id,
        passengerId: user.id,
        pickupCheckpointId: payload.pickupCheckpointId,
        dropCheckpointId: payload.dropCheckpointId,
        seatsBooked: payload.seatsBooked,
        costShareAmount,
      },
      include: {
        ride: {
          select: {
            id: true,
            originAddress: true,
            destinationAddress: true,
            departureTime: true,
            status: true,
            driver: { select: { id: true, name: true, image: true } },
            vehicle: { select: { model: true, color: true, plate: true } },
          },
        },
        passenger: { select: { id: true, name: true, image: true } },
        pickupCheckpoint: { select: { id: true, address: true, lat: true, lng: true, sequenceOrder: true } },
        dropCheckpoint: { select: { id: true, address: true, lat: true, lng: true, sequenceOrder: true } },
      },
    });
  });

  return result;
};

const getMyBookings = async (user: IRequestUser) => {
  return prisma.booking.findMany({
    where: { passengerId: user.id },
    include: {
      ride: {
        select: {
          id: true,
          originAddress: true,
          destinationAddress: true,
          departureTime: true,
          status: true,
          driver: { select: { id: true, name: true, image: true } },
          vehicle: { select: { model: true, color: true, plate: true } },
        },
      },
      pickupCheckpoint: { select: { id: true, address: true, lat: true, lng: true, sequenceOrder: true } },
      dropCheckpoint: { select: { id: true, address: true, lat: true, lng: true, sequenceOrder: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getRideBookings = async (rideId: string, user: IRequestUser) => {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) {
    throw new AppError(status.NOT_FOUND, "Ride not found");
  }
  if (ride.driverId !== user.id) {
    throw new AppError(status.FORBIDDEN, "You are not allowed to view bookings for this ride");
  }

  return prisma.booking.findMany({
    where: { rideId },
    include: {
      passenger: { select: { id: true, name: true, image: true } },
      pickupCheckpoint: { select: { id: true, address: true, lat: true, lng: true, sequenceOrder: true } },
      dropCheckpoint: { select: { id: true, address: true, lat: true, lng: true, sequenceOrder: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getBookingById = async (id: string, user: IRequestUser) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      ride: {
        select: {
          id: true,
          originAddress: true,
          destinationAddress: true,
          departureTime: true,
          status: true,
          driverId: true,
          driver: { select: { id: true, name: true, image: true } },
          vehicle: { select: { model: true, color: true, plate: true } },
        },
      },
      passenger: { select: { id: true, name: true, image: true } },
      pickupCheckpoint: { select: { id: true, address: true, lat: true, lng: true, sequenceOrder: true } },
      dropCheckpoint: { select: { id: true, address: true, lat: true, lng: true, sequenceOrder: true } },
    },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  const isPassenger = booking.passengerId === user.id;
  const isDriver = booking.ride.driverId === user.id;
  if (!isPassenger && !isDriver) {
    throw new AppError(status.FORBIDDEN, "You are not allowed to view this booking");
  }

  return booking;
};

const cancelBooking = async (id: string, payload: ICancelBooking, user: IRequestUser) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { ride: { select: { driverId: true } } },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  const isPassenger = booking.passengerId === user.id;
  const isDriver = booking.ride.driverId === user.id;
  if (!isPassenger && !isDriver) {
    throw new AppError(status.FORBIDDEN, "You are not allowed to cancel this booking");
  }

  if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
    throw new AppError(status.BAD_REQUEST, "Booking cannot be cancelled");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledById: user.id,
        cancellationReason: payload.cancellationReason,
        cancelledAt: new Date(),
      },
      include: {
        ride: {
          select: {
            id: true,
            originAddress: true,
            destinationAddress: true,
            departureTime: true,
            status: true,
            driver: { select: { id: true, name: true, image: true } },
            vehicle: { select: { model: true, color: true, plate: true } },
          },
        },
        passenger: { select: { id: true, name: true, image: true } },
        pickupCheckpoint: { select: { id: true, address: true, lat: true, lng: true, sequenceOrder: true } },
        dropCheckpoint: { select: { id: true, address: true, lat: true, lng: true, sequenceOrder: true } },
      },
    });

    await tx.ride.update({
      where: { id: booking.rideId },
      data: { availableSeats: { increment: booking.seatsBooked } },
    });

    return updated;
  });

  return result;
};

export const bookingService = {
  createBooking,
  getMyBookings,
  getRideBookings,
  getBookingById,
  cancelBooking,
};
