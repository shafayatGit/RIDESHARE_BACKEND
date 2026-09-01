import express, { Application, Request, Response } from "express";
import cors from "cors";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import { indexRouter } from "./routes";
import { envVars } from "./config/env";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import path from "path";

const app: Application = express();

app.use("/api/auth", toNodeHandler(auth));
app.set("view engine", "ejs"); // Set the views directory to the absolute path of src/app/templates
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

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
