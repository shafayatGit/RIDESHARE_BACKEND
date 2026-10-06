import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { favoriteController } from "./favorite.controller";
import {
  createFavoriteSchema,
  favoriteParamsSchema,
} from "./favorite.validation";

const route = Router();

route.use(authMiddleware);

route.post(
  "/create",
  validateRequest(createFavoriteSchema),
  favoriteController.createFavorite,
);

route.get("/", favoriteController.getMyFavorites);

route.delete(
  "/:riderId",
  validateRequest(favoriteParamsSchema, "params"),
  favoriteController.removeFavorite,
);

export const favoriteRoute = route;