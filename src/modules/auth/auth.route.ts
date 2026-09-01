import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

router.post("/register", validateRequest(registerSchema), authController.registerUser);

router.post("/login", validateRequest(loginSchema), authController.loginUser);

router.delete("/delete-account", authController.softDeleteUser);

export const authRouter = router;
