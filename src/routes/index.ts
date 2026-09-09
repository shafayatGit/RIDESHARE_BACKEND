import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route";
import { vehicleRoute } from "../modules/vehicle/vehicle.route";
import { rideRoute } from "../modules/ride/ride.route";
import { rideCheckpointRoute } from "../modules/rideCheckpoint/rideCheckpoint.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/vehicle", vehicleRoute);
router.use("/ride", rideRoute);
router.use("/ride-checkpoint", rideCheckpointRoute);

export const indexRouter = router;
