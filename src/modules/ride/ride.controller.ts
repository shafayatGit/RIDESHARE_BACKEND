import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ICreateRide, IUpdateRide } from "./ride.interface";
import { rideService } from "./ride.service";

const createRide = catchAsync(async (req: Request, res: Response) => {
  const payload: ICreateRide = req.body;
  const user = req.user;
  const result = await rideService.createRide(payload, user);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Ride created successfully",
    data: result,
  });
});

const getRideById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await rideService.getRideById(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Ride retrieved successfully",
    data: result,
  });
});

const getAllRides = catchAsync(async (req: Request, res: Response) => {
  const result = await rideService.getAllRides();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Rides retrieved successfully",
    data: result,
  });
});

const updateRide = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const payload: IUpdateRide = req.body;
  const user = req.user;
  const result = await rideService.updateRide(id, payload, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Ride updated successfully",
    data: result,
  });
});

const deleteRide = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user;
  const result = await rideService.deleteRide(id, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Ride deleted successfully",
    data: result,
  });
});

export const rideController = {
  createRide,
  getRideById,
  getAllRides,
  updateRide,
  deleteRide,
};
