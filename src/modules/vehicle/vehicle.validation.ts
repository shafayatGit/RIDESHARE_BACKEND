import z from "zod";

export const ICreateVehicleSchema = z.object({
  model: z.string().min(1).max(100),
  color: z.string().min(1).max(100),
  plate: z.string().min(1).max(100),
  seat_capacity: z.number().min(1).max(100),
});
