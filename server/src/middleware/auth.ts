import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError.js";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/user.model.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new ApiError(401, "Please login to continue.");

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).select("-passwordHash");
    if (!user) throw new ApiError(401, "Session expired. Please login again.");

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired token."));
  }
}
