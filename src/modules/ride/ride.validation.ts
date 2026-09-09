import z from "zod";
import { RideStatus } from "../../generated/prisma/enums";

export const rideParamsSchema = z.object({
  id: z.string().min(1),
});

export const createRideSchema = z.object({
  vehicleId: z.string().min(1),
  originAddress: z.string().min(1).max(200),
  originLat: z.number().min(-90).max(90),
  originLng: z.number().min(-180).max(180),
  destinationAddress: z.string().min(1).max(200),
  destinationLat: z.number().min(-90).max(90),
  destinationLng: z.number().min(-180).max(180),
  departureTime: z.coerce.date(),
  totalSeats: z.number().int().min(1),
  pricePerSeat: z.number().positive(),
  isFemaleOnly: z.boolean().optional(),
});

export const updateRideSchema = z
  .object({
    vehicleId: z.string().min(1).optional(),
    originAddress: z.string().min(1).max(200).optional(),
    originLat: z.number().min(-90).max(90).optional(),
    originLng: z.number().min(-180).max(180).optional(),
    destinationAddress: z.string().min(1).max(200).optional(),
    destinationLat: z.number().min(-90).max(90).optional(),
    destinationLng: z.number().min(-180).max(180).optional(),
    departureTime: z.coerce.date().optional(),
    totalSeats: z.number().int().min(1).optional(),
    availableSeats: z.number().int().min(0).optional(),
    pricePerSeat: z.number().positive().optional(),
    status: z.nativeEnum(RideStatus).optional(),
    isFemaleOnly: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
