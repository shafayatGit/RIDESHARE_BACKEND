import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { rideController } from "./ride.controller";
import {
  createRideSchema,
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

route.get("/", rideController.getAllRides);

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
