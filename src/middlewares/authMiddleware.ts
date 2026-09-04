import { NextFunction, Request, Response } from "express";
import status from "http-status";
import AppError from "../errors/AppError";
import { IRequestUser } from "../interfaces/requestUser.interface";
import { envVars } from "../config/env";
import { jwtUtils } from "../utils/jwt";

const extractToken = (req: Request): string | undefined => {
  const authorization = req.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice(7);
  }
  return req.cookies?.accessToken as string | undefined;
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = extractToken(req);

  if (!token) {
    throw new AppError(status.UNAUTHORIZED, "Authentication required");
  }

  const result = jwtUtils.verifyToken(token, envVars.ACCESS_TOKEN_SECRET);

  if (!result.success) {
    throw new AppError(status.UNAUTHORIZED, "Invalid or expired token");
  }

  const { id, email, name } = result.decoded as Partial<IRequestUser>;

  if (!id || !email) {
    throw new AppError(status.UNAUTHORIZED, "Invalid token payload");
  }

  req.user = { id, email, name } as IRequestUser;
  next();
};
