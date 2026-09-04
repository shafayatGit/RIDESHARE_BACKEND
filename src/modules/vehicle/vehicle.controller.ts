import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service";
import { ICreateVehicle } from "./vehicle.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createVehicle = catchAsync(async (req: Request, res: Response) => {
  const payload: ICreateVehicle = req.body;
  const user = req.user;
  const result = await vehicleService.createVehicle(payload, user);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Vehicle created successfully",
    data: result,
  });
});

export const vehicleController = {
  createVehicle,
};
