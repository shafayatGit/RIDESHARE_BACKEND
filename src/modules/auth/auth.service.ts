import { Request } from "express";
import status from "http-status";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { ILoginPayload, IRegisterPayload } from "./auth.interface";

const buildHeaders = (req: Request): Headers => {
  const headers = new Headers();
  headers.set("cookie", req.headers.cookie ?? "");
  headers.set("x-forwarded-for", req.ip ?? "");
  headers.set("user-agent", req.headers["user-agent"] ?? "");
  return headers;
};

const registerUser = async (req: Request, payload: IRegisterPayload) => {
  const { name, email, password, gender, image } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError(status.CONFLICT, "User already exists with this email");
  }

  const result = await auth.api.signUpEmail({
    body: { name, email, password, gender, image },
    headers: buildHeaders(req),
  });

  return {
    token: result.token,
    user: result.user,
  };
};

const loginUser = async (req: Request, payload: ILoginPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  }

  if (user.isDeleted) {
    throw new AppError(status.UNAUTHORIZED, "This account has been deactivated");
  }

  const result = await auth.api.signInEmail({
    body: { email, password },
    headers: buildHeaders(req),
  });

  return {
    token: result.token,
    user: result.user,
  };
};

const softDeleteUser = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: buildHeaders(req),
  });

  const currentUser = session?.user;
  if (!currentUser) {
    throw new AppError(status.UNAUTHORIZED, "You must be logged in");
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  await auth.api.signOut({
    headers: buildHeaders(req),
  });

  return currentUser;
};

export const authService = {
  registerUser,
  loginUser,
  softDeleteUser,
};
