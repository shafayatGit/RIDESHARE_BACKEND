import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { rideController } from "./ride.controller";
import {
  createRideSchema,
  estimateRideSchema,
  rideParamsSchema,
  updateRideSchema,
} from "./ride.validation";

const route = Router();

route.get("/", rideController.getAllRides);
route.get(
  "/:id",
  validateRequest(rideParamsSchema, "params"),
  rideController.getRideById,
);

route.use(authMiddleware);

route.post(
  "/create",
  validateRequest(createRideSchema),
  rideController.createRide,
);

route.post(
  "/estimate",
  validateRequest(estimateRideSchema),
  rideController.estimateRidePrice,
);

// Declared before "/:id" so it is not captured as a ride id.
route.get("/my", rideController.getMyRides);

route.patch(
  "/:id",
  validateRequest(updateRideSchema),
  rideController.updateRide,
);

route.delete("/:id", rideController.deleteRide);

export const rideRoute = route;
