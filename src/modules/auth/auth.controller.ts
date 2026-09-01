import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";
import { ILoginPayload, IRegisterPayload } from "./auth.interface";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req, req.body as IRegisterPayload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req, req.body as ILoginPayload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.softDeleteUser(req);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User account deleted successfully",
    data: { user },
  });
});

export const authController = {
  registerUser,
  loginUser,
  softDeleteUser,
};
