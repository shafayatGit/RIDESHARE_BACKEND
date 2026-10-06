import status from "http-status";
import AppError from "../../errors/AppError";
import { AccountStatus } from "../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateFavorite } from "./favorite.interface";

const riderSelect = {
  id: true,
  name: true,
  image: true,
  isVerified: true,
  avgRatingAsDriver: true,
  ratingCount: true,
};

const ensureActivePassenger = async (userId: string) => {
  const passenger = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (
    !passenger ||
    passenger.isDeleted ||
    passenger.accountStatus === AccountStatus.DEACTIVATED
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to perform this action",
    );
  }

  return passenger;
};

const createFavorite = async (payload: ICreateFavorite, user: IRequestUser) => {
  const passenger = await ensureActivePassenger(user.id);

  if (passenger.id === payload.riderId) {
    throw new AppError(status.BAD_REQUEST, "You cannot favorite yourself");
  }

  const rider = await prisma.user.findUnique({
    where: { id: payload.riderId },
    select: { id: true, isDeleted: true, accountStatus: true },
  });

  if (
    !rider ||
    rider.isDeleted ||
    rider.accountStatus === AccountStatus.DEACTIVATED
  ) {
    throw new AppError(status.NOT_FOUND, "Driver not found");
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      passengerId_riderId: {
        passengerId: passenger.id,
        riderId: rider.id,
      },
    },
  });

  if (existing) {
    throw new AppError(
      status.CONFLICT,
      "This driver is already in your favorites",
    );
  }

  const favorite = await prisma.favorite.create({
    data: { passengerId: passenger.id, riderId: rider.id },
    include: { rider: { select: riderSelect } },
  });

  return favorite;
};

const removeFavorite = async (riderId: string, user: IRequestUser) => {
  await ensureActivePassenger(user.id);

  const favorite = await prisma.favorite.findUnique({
    where: { passengerId_riderId: { passengerId: user.id, riderId } },
  });

  if (!favorite) {
    throw new AppError(status.NOT_FOUND, "Favorite not found");
  }

  await prisma.favorite.delete({
    where: { passengerId_riderId: { passengerId: user.id, riderId } },
  });

  return favorite;
};

const getMyFavorites = async (user: IRequestUser) => {
  return prisma.favorite.findMany({
    where: { passengerId: user.id },
    include: { rider: { select: riderSelect } },
    orderBy: { createdAt: "desc" },
  });
};

export const favoriteService = {
  createFavorite,
  removeFavorite,
  getMyFavorites,
};