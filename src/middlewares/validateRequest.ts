import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (
  zodObject: z.ZodObject,
  location: "body" | "params" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const source = location === "body" ? req.body : req.params;

    let data = source;
    if (location === "body" && req.body.data) {
      data = JSON.parse(req.body.data);
    }

    const parseResult = zodObject.safeParse(data);

    if (!parseResult.success) {
      return next(parseResult.error);
    }

    // If validation is successful, proceed to the controller
    if (location === "body") {
      req.body = parseResult.data; // Use the parsed data
    }
    next();
  };
};
