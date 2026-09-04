import { Request, Response } from "express";
import status from "http-status";
import { vehicleService } from "./vehicle.service";
import { ICreateVehicle, IUpdateVehicle } from "./vehicle.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createVehicle = catchAsync(async (req: Request, res: Response) => {
  const payload: ICreateVehicle = req.body;
  const user = req.user;
  const result = await vehicleService.createVehicle(payload, user);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Vehicle created successfully",
    data: result,
  });
});

const updateVehicle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const payload: IUpdateVehicle = req.body;
  const user = req.user;
  const result = await vehicleService.updateVehicle(id, payload, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Vehicle updated successfully",
    data: result,
  });
});

const getVehicleById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user;
  const result = await vehicleService.getVehicleById(id, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Vehicle retrieved successfully",
    data: result,
  });
});

const getAllVehicles = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await vehicleService.getAllVehicles(user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Vehicles retrieved successfully",
    data: result,
  });
});

const deleteVehicle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user;
  const result = await vehicleService.deleteVehicle(id, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Vehicle deleted successfully",
    data: result,
  });
});

export const vehicleController = {
  createVehicle,
  updateVehicle,
  getVehicleById,
  getAllVehicles,
  deleteVehicle,
};
