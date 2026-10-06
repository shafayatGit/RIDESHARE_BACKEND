import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ICreateRating } from "./rating.interface";
import { ratingService } from "./rating.service";

const createRating = catchAsync(async (req: Request, res: Response) => {
  const payload: ICreateRating = req.body;
  const user = req.user;
  const result = await ratingService.createRating(payload, user.id);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Rating submitted successfully",
    data: result,
  });
});

const getRiderRatings = catchAsync(async (req: Request, res: Response) => {
  const { riderId } = req.params as { riderId: string };
  const result = await ratingService.getRiderRatings(riderId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Driver ratings retrieved successfully",
    data: result,
  });
});

const getMyGivenRatings = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await ratingService.getMyGivenRatings(user.id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Ratings you have given retrieved successfully",
    data: result,
  });
});

export const ratingController = {
  createRating,
  getRiderRatings,
  getMyGivenRatings,
};