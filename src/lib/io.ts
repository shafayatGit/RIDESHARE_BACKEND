import { createServer } from "http";
import { Server } from "socket.io";
import app from "../app";
import { envVars } from "../config/env";

const allowedOrigins = [
  envVars.BETTER_AUTH_URL,
  ...envVars.FRONTEND_URL.split(",").map((origin) => origin.trim()),
];

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

export { httpServer, io };
