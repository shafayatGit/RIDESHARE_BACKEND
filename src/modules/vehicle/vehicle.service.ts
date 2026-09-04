import status from "http-status";
import AppError from "../../errors/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { AccountStatus } from "../../generated/prisma/enums";
import { ICreateVehicle, IUpdateVehicle } from "./vehicle.interface";

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

const updateVehicle = async (
  id: string,
  payload: IUpdateVehicle,
  user: IRequestUser,
) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });

  if (!vehicle) {
    throw new AppError(status.NOT_FOUND, "Vehicle not found");
  }

  if (vehicle.ownerId !== user.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to update this vehicle",
    );
  }

  if (payload.plate && payload.plate !== vehicle.plate) {
    const existingPlate = await prisma.vehicle.findFirst({
      where: { plate: payload.plate },
    });

    if (existingPlate) {
      throw new AppError(
        status.CONFLICT,
        "A vehicle with this plate already exists",
      );
    }
  }

  const updatedVehicle = await prisma.vehicle.update({
    where: { id },
    data: payload,
  });

  return updatedVehicle;
};

const getVehicleById = async (id: string, user: IRequestUser) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });

  if (!vehicle) {
    throw new AppError(status.NOT_FOUND, "Vehicle not found");
  }

  if (vehicle.ownerId !== user.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to view this vehicle",
    );
  }

  return vehicle;
};

const getAllVehicles = async (user: IRequestUser) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: user.id },
  });

  return vehicles;
};

const deleteVehicle = async (id: string, user: IRequestUser) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });

  if (!vehicle) {
    throw new AppError(status.NOT_FOUND, "Vehicle not found");
  }

  if (vehicle.ownerId !== user.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to delete this vehicle",
    );
  }

  await prisma.vehicle.delete({ where: { id } });

  return vehicle;
};

export const vehicleService = {
  createVehicle,
  updateVehicle,
  getVehicleById,
  getAllVehicles,
  deleteVehicle,
};
