import { Server, Socket } from "socket.io";
import { envVars } from "../../config/env";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { jwtUtils } from "../../utils/jwt";
import {
  IJoinRidePayload,
  IMarkReadPayload,
  ISendMessagePayload,
} from "./chat.interface";
import { chatService } from "./chat.service";

const roomForRide = (rideId: string) => `ride:${rideId}`;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token as string | undefined;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  const result = jwtUtils.verifyToken(token, envVars.ACCESS_TOKEN_SECRET);

  if (!result.success) {
    return next(new Error("Invalid or expired token"));
  }

  const { id, email, name } = result.decoded as Partial<IRequestUser>;

  if (!id || !email) {
    return next(new Error("Invalid token payload"));
  }

  socket.data.user = { id, email, name } as IRequestUser;
  next();
};

const emitError = (socket: Socket, error: unknown) => {
  socket.emit("error", { message: getErrorMessage(error) });
};

export const initChatSocket = (io: Server) => {
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const { id: userId } = socket.data.user;

    socket.on("ride:join", async (payload: IJoinRidePayload) => {
      try {
        const messages = await chatService.getRideMessages(payload.rideId);
        socket.join(roomForRide(payload.rideId));
        socket.emit("messages:load", messages);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on("message:send", async (payload: ISendMessagePayload) => {
      try {
        const message = await chatService.createMessage(
          payload.rideId,
          userId,
          payload.content,
        );
        io.to(roomForRide(payload.rideId)).emit("message:new", message);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on("messages:read", async (payload: IMarkReadPayload) => {
      try {
        const { count } = await chatService.markMessagesRead(
          payload.messageIds,
          userId,
        );
        if (count > 0) {
          io.to(roomForRide(payload.rideId)).emit("messages:read", {
            messageIds: payload.messageIds,
            readAt: new Date(),
            readerId: userId,
          });
        }
      } catch (error) {
        emitError(socket, error);
      }
    });
  });
};
