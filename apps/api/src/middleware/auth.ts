import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Authentication token required");
  }

  const token = header.split(" ")[1];
  req.user = verifyToken(token);
  next();
};
