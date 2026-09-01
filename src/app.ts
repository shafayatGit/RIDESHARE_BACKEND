import express, { Application, Request, Response } from "express";
import cors from "cors";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import { indexRouter } from "./routes";
import { envVars } from "./config/env";
import cookieParser from "cookie-parser";

const app: Application = express();

// parsers
app.use(express.json());
app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:8000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies.
app.use(express.json());
app.use(cookieParser());

// application routes
app.use("/", indexRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Rideshare!");
});

// global error handler

app.use(globalErrorHandler);
app.use(notFound);

export default app;
