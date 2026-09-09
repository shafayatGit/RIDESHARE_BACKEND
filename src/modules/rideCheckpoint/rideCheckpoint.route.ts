import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { rideCheckpointController } from "./rideCheckpoint.controller";
import {
  createRideCheckpointSchema,
  rideCheckpointParamsSchema,
  rideCheckpointQuerySchema,
  updateRideCheckpointSchema,
} from "./rideCheckpoint.validation";

const route = Router();

route.use(authMiddleware);

route.post(
  "/create",
  validateRequest(createRideCheckpointSchema),
  rideCheckpointController.createRideCheckpoint,
);

route.get(
  "/ride/:rideId",
  validateRequest(rideCheckpointQuerySchema, "params"),
  rideCheckpointController.getRideCheckpoints,
);

route.patch(
  "/:id",
  validateRequest(rideCheckpointParamsSchema, "params"),
  validateRequest(updateRideCheckpointSchema),
  rideCheckpointController.updateRideCheckpoint,
);

route.delete(
  "/:id",
  validateRequest(rideCheckpointParamsSchema, "params"),
  rideCheckpointController.deleteRideCheckpoint,
);

export const rideCheckpointRoute = route;
