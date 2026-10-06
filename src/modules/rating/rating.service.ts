import status from "http-status";
import AppError from "../../errors/AppError";
import { AccountStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateRating } from "./rating.interface";

const RECENT_RATING_LIMIT = 50;

const ensureActiveRider = async (riderId: string, raterId: string) => {
  const rider = await prisma.user.findUnique({ where: { id: riderId } });

  if (!rider || rider.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Rider not found");
  }

  if (rider.accountStatus === AccountStatus.DEACTIVATED) {
    throw new AppError(
      status.BAD_REQUEST,
      "This rider is no longer accepting ratings",
    );
  }

  if (rider.id === raterId) {
    throw new AppError(status.BAD_REQUEST, "You cannot rate yourself");
  }
};

/**
 * A rating belongs to the rider, but it must still come from someone who
 * actually rode with them: look for a non-cancelled booking between the rater
 * and one of this rider's completed rides.
 */
const findRiddenBookingId = async (
  riderId: string,
  raterId: string,
): Promise<string | null> => {
  const booking = await prisma.booking.findFirst({
    where: {
      passengerId: raterId,
      status: { not: "CANCELLED" },
      ride: {
        driverId: riderId,
        status: "COMPLETED",
      },
    },
    select: { id: true },
    orderBy: { bookingTime: "desc" },
  });

  return booking?.id ?? null;
};

const createRating = async (payload: ICreateRating, userId: string) => {
  await ensureActiveRider(payload.riderId, userId);

  const bookingId = await findRiddenBookingId(payload.riderId, userId);

  if (!bookingId) {
    throw new AppError(
      status.FORBIDDEN,
      "You can only rate a rider after completing a ride with them",
    );
  }

  const created = await prisma.$transaction(async (tx) => {
    // One rating per rider per rater, so rating again updates the existing one.
    const rating = await tx.rating.upsert({
      where: {
        riderId_raterId: {
          riderId: payload.riderId,
          raterId: userId,
        },
      },
      create: {
        riderId: payload.riderId,
        raterId: userId,
        bookingId,
        rating: payload.rating,
        review: payload.review,
      },
      update: {
        rating: payload.rating,
        review: payload.review,
        bookingId,
      },
    });

    // Recompute the rider's overall score from every rating they have.
    const aggregate = await tx.rating.aggregate({
      where: { riderId: payload.riderId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.user.update({
      where: { id: payload.riderId },
      data: {
        avgRatingAsDriver: aggregate._avg.rating ?? 0,
        ratingCount: aggregate._count.rating,
      },
    });

    return rating;
  });

  return created;
};

/** Every review a rider has received. */
const getRiderRatings = async (riderId: string) => {
  const rider = await prisma.user.findUnique({
    where: { id: riderId },
    select: { id: true, isDeleted: true },
  });

  if (!rider || rider.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Rider not found");
  }

  return prisma.rating.findMany({
    where: { riderId },
    select: {
      id: true,
      riderId: true,
      raterId: true,
      rating: true,
      review: true,
      createdAt: true,
      updatedAt: true,
      rater: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: RECENT_RATING_LIMIT,
  });
};

/** Ratings the signed-in passenger has given, with each rider's score. */
const getMyGivenRatings = async (userId: string) => {
  return prisma.rating.findMany({
    where: { raterId: userId },
    select: {
      id: true,
      riderId: true,
      rating: true,
      review: true,
      createdAt: true,
      updatedAt: true,
      rider: {
        select: {
          id: true,
          name: true,
          image: true,
          avgRatingAsDriver: true,
          ratingCount: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
};

export const ratingService = {
  createRating,
  getRiderRatings,
  getMyGivenRatings,
};