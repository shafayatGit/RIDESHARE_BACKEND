import { IRequestUser } from "./requestUser.interface";

declare global {
  namespace Express {
    interface Request {
      user: IRequestUser;
    }
  }
}

declare module "socket.io" {
  interface SocketData {
    user: IRequestUser;
  }
}
