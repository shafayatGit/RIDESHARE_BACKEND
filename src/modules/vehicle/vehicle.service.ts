import status from "http-status";
import AppError from "../../errors/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { AccountStatus } from "../../generated/prisma/enums";
import { ICreateVehicle } from "./vehicle.interface";

const createVehicle = async (payload: ICreateVehicle, user: IRequestUser) => {
  const owner = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (
    !owner ||
    owner.isDeleted ||
    owner.accountStatus === AccountStatus.DEACTIVATED
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to create a vehicle",
    );
  }

  const existingPlate = await prisma.vehicle.findFirst({
    where: { plate: payload.plate },
  });

  if (existingPlate) {
    throw new AppError(status.CONFLICT, "A vehicle with this plate already exists");
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      ownerId: owner.id,
      model: payload.model,
      color: payload.color,
      plate: payload.plate,
      seat_capacity: payload.seat_capacity,
    },
  });

  return vehicle;
};

export const vehicleService = {
  createVehicle,
};
