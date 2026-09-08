import status from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

const messageInclude = {
  sender: { select: { id: true, name: true } },
};

const ensureRideExists = async (rideId: string) => {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    select: { id: true },
  });

  if (!ride) {
    throw new AppError(status.NOT_FOUND, "Ride not found");
  }
};

const getRideMessages = async (rideId: string) => {
  await ensureRideExists(rideId);

  return prisma.message.findMany({
    where: { rideId },
    include: messageInclude,
    orderBy: { sentAt: "asc" },
  });
};

const createMessage = async (
  rideId: string,
  senderId: string,
  content: string,
) => {
  await ensureRideExists(rideId);

  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new AppError(status.BAD_REQUEST, "Message content is required");
  }

  return prisma.message.create({
    data: { rideId, senderId, content: trimmedContent },
    include: messageInclude,
  });
};

const markMessagesRead = async (messageIds: string[], userId: string) => {
  if (messageIds.length === 0) {
    throw new AppError(status.BAD_REQUEST, "No messages to mark as read");
  }

  return prisma.message.updateMany({
    where: { id: { in: messageIds }, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });
};

export const chatService = {
  getRideMessages,
  createMessage,
  markMessagesRead,
};
