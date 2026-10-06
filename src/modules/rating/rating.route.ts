import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { ratingController } from "./rating.controller";
import { createRatingSchema, riderParamsSchema } from "./rating.validation";

const route = Router();

route.use(authMiddleware);

route.post(
  "/create",
  validateRequest(createRatingSchema),
  ratingController.createRating,
);

// Declared before "/rider/:riderId" so it is not captured as a rider id.
route.get("/my", ratingController.getMyGivenRatings);

route.get(
  "/rider/:riderId",
  validateRequest(riderParamsSchema, "params"),
  ratingController.getRiderRatings,
);

export const ratingRoute = route;