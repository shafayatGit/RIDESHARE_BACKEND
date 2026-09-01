import { Gender } from "../../generated/prisma/client";

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  gender: Gender;
  image?: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}
