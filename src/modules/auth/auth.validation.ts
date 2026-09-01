import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  password: z.string().min(8).max(72),
  gender: z.enum(["MALE", "FEMALE"]),
  image: z.string().url().optional(),
  phoneNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const sendOTPSchema = z.object({
  email: z.email(),
});

export const verifyOTPSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SendOTPInput = z.infer<typeof sendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
