import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { authController } from "./auth.controller";
import {
  loginSchema,
  registerSchema,
  sendOTPSchema,
  verifyOTPSchema,
} from "./auth.validation";

const router = Router();

router.post("/register", validateRequest(registerSchema), authController.registerUser);

router.post("/login", validateRequest(loginSchema), authController.loginUser);

router.post("/send-otp", validateRequest(sendOTPSchema), authController.sendOTP);

router.post("/resend-otp", validateRequest(sendOTPSchema), authController.resendOTP);

router.post("/verify-otp", validateRequest(verifyOTPSchema), authController.verifyOTP);

router.delete("/delete-account", authController.softDeleteUser);

export const authRouter = router;
