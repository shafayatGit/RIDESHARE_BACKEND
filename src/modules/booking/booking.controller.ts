import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ICancelBooking, ICreateBooking } from "./booking.interface";
import { bookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const payload: ICreateBooking = req.body;
  const user = req.user;
  const result = await bookingService.createBooking(payload, user);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await bookingService.getMyBookings(user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const getRideBookings = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params as { rideId: string };
  const user = req.user;
  const result = await bookingService.getRideBookings(rideId, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Ride bookings retrieved successfully",
    data: result,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user;
  const result = await bookingService.getBookingById(id, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking retrieved successfully",
    data: result,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const payload: ICancelBooking = req.body;
  const user = req.user;
  const result = await bookingService.cancelBooking(id, payload, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking cancelled successfully",
    data: result,
  });
});

export const bookingController = {
  createBooking,
  getMyBookings,
  getRideBookings,
  getBookingById,
  cancelBooking,
};