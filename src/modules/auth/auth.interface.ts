import { Gender } from "../../generated/prisma/client";

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  gender: Gender;
  image?: string;
  phoneNumber?: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface ISendOTPPayload {
  email: string;
}

export interface IVerifyOTPPayload {
  email: string;
  otp: string;
}
