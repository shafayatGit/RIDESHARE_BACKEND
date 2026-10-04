import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { bookingController } from "./booking.controller";
import {
  bookingParamsSchema,
  cancelBookingSchema,
  createBookingSchema,
} from "./booking.validation";

const route = Router();

route.use(authMiddleware);

route.post(
  "/create",
  validateRequest(createBookingSchema),
  bookingController.createBooking,
);

route.get("/my-bookings", bookingController.getMyBookings);

route.get(
  "/ride/:rideId",
  bookingController.getRideBookings,
);

route.get(
  "/:id",
  validateRequest(bookingParamsSchema, "params"),
  bookingController.getBookingById,
);

route.patch(
  "/:id/cancel",
  validateRequest(bookingParamsSchema, "params"),
  validateRequest(cancelBookingSchema),
  bookingController.cancelBooking,
);

export const bookingRoute = route;