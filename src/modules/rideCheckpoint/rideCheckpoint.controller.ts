import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import {
  ICreateRideCheckpoint,
  IUpdateRideCheckpoint,
} from "./rideCheckpoint.interface";
import { rideCheckpointService } from "./rideCheckpoint.service";

const createRideCheckpoint = catchAsync(async (req: Request, res: Response) => {
  const payload: ICreateRideCheckpoint = req.body;
  const user = req.user;
  const result = await rideCheckpointService.createRideCheckpoint(
    payload,
    user,
  );

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Ride checkpoint created successfully",
    data: result,
  });
});

const getRideCheckpoints = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params as { rideId: string };
  const result = await rideCheckpointService.getRideCheckpoints(rideId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Ride checkpoints retrieved successfully",
    data: result,
  });
});

const updateRideCheckpoint = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const payload: IUpdateRideCheckpoint = req.body;
  const user = req.user;
  const result = await rideCheckpointService.updateRideCheckpoint(
    id,
    payload,
    user,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Ride checkpoint updated successfully",
    data: result,
  });
});

const deleteRideCheckpoint = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user;
  const result = await rideCheckpointService.deleteRideCheckpoint(id, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Ride checkpoint deleted successfully",
    data: result,
  });
});

export const rideCheckpointController = {
  createRideCheckpoint,
  getRideCheckpoints,
  updateRideCheckpoint,
  deleteRideCheckpoint,
};
