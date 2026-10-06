import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ICreateFavorite } from "./favorite.interface";
import { favoriteService } from "./favorite.service";

const createFavorite = catchAsync(async (req: Request, res: Response) => {
  const payload: ICreateFavorite = req.body;
  const user = req.user;
  const result = await favoriteService.createFavorite(payload, user);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Driver added to favorites",
    data: result,
  });
});

const removeFavorite = catchAsync(async (req: Request, res: Response) => {
  const { riderId } = req.params as { riderId: string };
  const user = req.user;
  const result = await favoriteService.removeFavorite(riderId, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Driver removed from favorites",
    data: result,
  });
});

const getMyFavorites = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await favoriteService.getMyFavorites(user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Favorites retrieved successfully",
    data: result,
  });
});

export const favoriteController = {
  createFavorite,
  removeFavorite,
  getMyFavorites,
};