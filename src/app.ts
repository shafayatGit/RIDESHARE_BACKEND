import express, { Application, Request, Response } from "express";
import cors from "cors";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import { indexRouter } from "./routes";

const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());

// application routes
app.use("/", indexRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Rideshare!");
});

// global error handler

app.use(globalErrorHandler);
app.use(notFound);

export default app;
