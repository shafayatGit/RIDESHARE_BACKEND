import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route";
import { vehicleRoute } from "../modules/vehicle/vehicle.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/vehicle", vehicleRoute);

export const indexRouter = router;
