import z from "zod";
import { CheckpointType } from "../../generated/prisma/enums";

export const rideCheckpointParamsSchema = z.object({
  id: z.string().min(1),
});

export const rideCheckpointQuerySchema = z.object({
  rideId: z.string().min(1),
});

export const createRideCheckpointSchema = z.object({
  rideId: z.string().min(1),
  type: z.enum(CheckpointType),
  address: z.string().min(1).max(200),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  sequenceOrder: z.number().int().min(1).optional(),
  estimatedTime: z.coerce.date().optional(),
});

export const updateRideCheckpointSchema = z
  .object({
    type: z.enum(CheckpointType).optional(),
    address: z.string().min(1).max(200).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    sequenceOrder: z.number().int().min(1).optional(),
    estimatedTime: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
