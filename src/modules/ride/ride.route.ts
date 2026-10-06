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

route.get("/", rideController.getAllRides);

// Declared before "/:id" so it is not captured as a ride id.
route.get("/my", rideController.getMyRides);

route.get(
  "/:id",
  validateRequest(rideParamsSchema, "params"),
  rideController.getRideById,
);

route.patch(
  "/:id",
  validateRequest(updateRideSchema),
  rideController.updateRide,
);

route.delete("/:id", rideController.deleteRide);

export const rideRoute = route;
