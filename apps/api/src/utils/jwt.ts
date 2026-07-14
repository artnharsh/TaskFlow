import jwt from "jsonwebtoken";
import { config } from "../config/env";
import ApiError from "./ApiError";

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
  } catch (e) {
    throw ApiError.unauthorized("Invalid or expired authentication token");
  }
};
