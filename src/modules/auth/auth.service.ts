import { Request, Response } from "express";
import status from "http-status";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { tokenUtils } from "../../utils/token";
import {
  ILoginPayload,
  IRegisterPayload,
  ISendOTPPayload,
  IVerifyOTPPayload,
} from "./auth.interface";

const buildHeaders = (req: Request): Headers => {
  const headers = new Headers();
  headers.set("cookie", req.headers.cookie ?? "");
  headers.set("x-forwarded-for", req.ip ?? "");
  headers.set("user-agent", req.headers["user-agent"] ?? "");
  return headers;
};

const registerUser = async (req: Request, payload: IRegisterPayload) => {
  const { name, email, password, gender, image, phoneNumber } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError(status.CONFLICT, "User already exists with this email");
  }

  const result = await auth.api.signUpEmail({
    body: { name, email, password, gender, image, phoneNumber },
    headers: buildHeaders(req),
  });

  return {
    token: result.token,
    user: result.user,
  };
};

const loginUser = async (
  req: Request,
  res: Response,
  payload: ILoginPayload,
) => {
  const { email, password } = payload;

  const user = await prisma.user.findFirst({
    where: {
      email: email?.toLowerCase(),
    },
  });

  if (!user || user.isDeleted) {
    throw new AppError(status.UNAUTHORIZED, "Invalid credentials");
  }

  if (!user.emailVerified) {
    throw new AppError(
      status.FORBIDDEN,
      "Please verify your email before logging in",
    );
  }

  const result = await auth.api.signInEmail({
    body: { email, password },
    headers: buildHeaders(req),
  });

  const accessToken = tokenUtils.getAccessToken({
    id: user.id,
    email: user.email,
  });
  const refreshToken = tokenUtils.getRefreshToken({
    id: user.id,
    email: user.email,
  });

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, result.token);

  return {
    accessToken,
    refreshToken,
    token: result.token,
    user,
  };
};

const sendOTP = async (req: Request, { email }: ISendOTPPayload) => {
  await prisma.user.findUniqueOrThrow({
    where: { email: email.toLowerCase() },
  });

  await auth.api.sendVerificationOTP({
    body: { email, type: "email-verification" },
    headers: buildHeaders(req),
  });

  return { email };
};

const verifyOTP = async (req: Request, { email, otp }: IVerifyOTPPayload) => {
  const result = await auth.api.verifyEmailOTP({
    body: { email, otp },
    headers: buildHeaders(req),
  });

  if (!result.status) {
    throw new AppError(status.UNAUTHORIZED, "Invalid or expired OTP");
  }

  return result;
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
  sendOTP,
  verifyOTP,
  softDeleteUser,
};
