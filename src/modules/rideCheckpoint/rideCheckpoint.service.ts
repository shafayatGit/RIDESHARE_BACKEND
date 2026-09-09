import status from "http-status";
import AppError from "../../errors/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import {
  ICreateRideCheckpoint,
  IUpdateRideCheckpoint,
} from "./rideCheckpoint.interface";

const ensureRideDriver = async (rideId: string, userId: string) => {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });

  if (!ride) {
    throw new AppError(status.NOT_FOUND, "Ride not found");
  }

  if (ride.driverId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to manage checkpoints for this ride",
    );
  }
};

const createRideCheckpoint = async (
  payload: ICreateRideCheckpoint,
  user: IRequestUser,
) => {
  await ensureRideDriver(payload.rideId, user.id);

  let sequenceOrder = payload.sequenceOrder;

  if (sequenceOrder == null) {
    const max = await prisma.rideCheckpoint.aggregate({
      where: { rideId: payload.rideId },
      _max: { sequenceOrder: true },
    });
    sequenceOrder = (max._max.sequenceOrder ?? 0) + 1;
  }

  const checkpoint = await prisma.rideCheckpoint.create({
    data: {
      rideId: payload.rideId,
      type: payload.type,
      address: payload.address,
      lat: payload.lat,
      lng: payload.lng,
      sequenceOrder,
      estimatedTime: payload.estimatedTime,
    },
  });

  return checkpoint;
};

const getRideCheckpoints = async (rideId: string) => {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    select: { id: true },
  });

  if (!ride) {
    throw new AppError(status.NOT_FOUND, "Ride not found");
  }

  return prisma.rideCheckpoint.findMany({
    where: { rideId },
    orderBy: { sequenceOrder: "asc" },
  });
};

const updateRideCheckpoint = async (
  id: string,
  payload: IUpdateRideCheckpoint,
  user: IRequestUser,
) => {
  const checkpoint = await prisma.rideCheckpoint.findUnique({ where: { id } });

  if (!checkpoint) {
    throw new AppError(status.NOT_FOUND, "Ride checkpoint not found");
  }

  await ensureRideDriver(checkpoint.rideId, user.id);

  return prisma.rideCheckpoint.update({
    where: { id },
    data: payload,
  });
};

const deleteRideCheckpoint = async (id: string, user: IRequestUser) => {
  const checkpoint = await prisma.rideCheckpoint.findUnique({ where: { id } });

  if (!checkpoint) {
    throw new AppError(status.NOT_FOUND, "Ride checkpoint not found");
  }

  await ensureRideDriver(checkpoint.rideId, user.id);

  await prisma.rideCheckpoint.delete({ where: { id } });

  return checkpoint;
};

export const rideCheckpointService = {
  createRideCheckpoint,
  getRideCheckpoints,
  updateRideCheckpoint,
  deleteRideCheckpoint,
};
