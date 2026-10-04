import z from "zod";

export const createBookingSchema = z.object({
  rideId: z.string().min(1),
  seatsBooked: z.number().int().min(1),
  pickupCheckpointId: z.string().min(1),
  dropCheckpointId: z.string().min(1),
});

export const cancelBookingSchema = z.object({
  cancellationReason: z.string().max(500).optional(),
});

export const bookingParamsSchema = z.object({
  id: z.string().min(1),
});
