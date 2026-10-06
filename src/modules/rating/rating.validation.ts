import { z } from "zod";

export const riderParamsSchema = z.object({
  riderId: z.string().min(1),
});

export const createRatingSchema = z.object({
  riderId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().max(500).optional(),
});