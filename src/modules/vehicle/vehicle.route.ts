import { Router } from "express";
import { vehicleController } from "./vehicle.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authMiddleware } from "../../middlewares/authMiddleware";
import {
  ICreateVehicleSchema,
  IUpdateVehicleSchema,
} from "./vehicle.validation";

const route = Router();

route.use(authMiddleware);

route.post(
  "/create",
  validateRequest(ICreateVehicleSchema),
  vehicleController.createVehicle,
);

route.get("/", vehicleController.getAllVehicles);

route.get("/:id", vehicleController.getVehicleById);

route.patch(
  "/:id",
  validateRequest(IUpdateVehicleSchema),
  vehicleController.updateVehicle,
);

route.delete("/:id", vehicleController.deleteVehicle);

export const vehicleRoute = route;
