import z from "zod";

export const vehicleParamsSchema = z.object({
  id: z.string().min(1),
});

export const ICreateVehicleSchema = z.object({
  model: z.string().min(1).max(100),
  color: z.string().min(1).max(100),
  plate: z.string().min(1).max(100),
  seat_capacity: z.number().min(1).max(100),
});

export const IUpdateVehicleSchema = z
  .object({
    model: z.string().min(1).max(100).optional(),
    color: z.string().min(1).max(100).optional(),
    plate: z.string().min(1).max(100).optional(),
    seat_capacity: z.number().min(1).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
