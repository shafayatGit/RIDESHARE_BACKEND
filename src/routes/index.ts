import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route";
import { vehicleRoute } from "../modules/vehicle/vehicle.route";
import { rideRoute } from "../modules/ride/ride.route";
import { rideCheckpointRoute } from "../modules/rideCheckpoint/rideCheckpoint.route";
import { bookingRoute } from "../modules/booking/booking.route";
import { favoriteRoute } from "../modules/favorite/favorite.route";
import { ratingRoute } from "../modules/rating/rating.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/vehicle", vehicleRoute);
router.use("/ride", rideRoute);
router.use("/ride-checkpoint", rideCheckpointRoute);
router.use("/booking", bookingRoute);
router.use("/favorite", favoriteRoute);
router.use("/rating", ratingRoute);

export const indexRouter = router;