import { Router } from "express";
import { vehicleController } from "./vehicle.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { ICreateVehicleSchema } from "./vehicle.validation";

const route = Router();
route.post(
  "/create",
  authMiddleware,
  validateRequest(ICreateVehicleSchema),
  vehicleController.createVehicle,
);

export const vehicleRoute = route;
