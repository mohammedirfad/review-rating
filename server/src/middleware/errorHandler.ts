import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(422).json({
      message: "Validation failed.",
      errors: error.flatten().fieldErrors
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
  }

  if (error && typeof error === "object" && "code" in error && error.code === 11000) {
    const keyPattern = "keyPattern" in error ? error.keyPattern : null;
    if (
      keyPattern &&
      typeof keyPattern === "object" &&
      "company" in keyPattern &&
      "user" in keyPattern
    ) {
      return res.status(409).json({ message: "You have already reviewed this company." });
    }
    return res.status(409).json({ message: "A record with these details already exists." });
  }

  console.error(error);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}
