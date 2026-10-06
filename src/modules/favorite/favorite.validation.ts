import z from "zod";

export const createFavoriteSchema = z.object({
  riderId: z.string().min(1),
});

export const favoriteParamsSchema = z.object({
  riderId: z.string().min(1),
});