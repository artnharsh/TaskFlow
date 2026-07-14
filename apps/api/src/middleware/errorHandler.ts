import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

/**
 * Global HTTP Error Handler Middleware.
 * Catches all controller exceptions, standardizes PostgreSQL error codes,
 * and formats consistent API error payloads with context.
 */
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // PostgreSQL Error Codes Translation
  if (err.code) {
    switch (err.code) {
      case "23505": // Unique constraint violation (e.g. duplicate email)
        statusCode = 409;
        message = err.detail
          ? `Resource already exists: ${err.detail}`
          : "Conflict: Resource with these details already exists.";
        break;
      case "23503": // Foreign key constraint violation
        statusCode = 400;
        message = "Invalid reference: The referenced parent entity does not exist.";
        break;
      case "22P02": // Invalid text representation (e.g. malformed UUID string)
        statusCode = 400;
        message = "Invalid identifier format provided (expected valid UUID).";
        break;
      case "23502": // Not-null constraint violation
        statusCode = 400;
        message = `Missing required database field: ${err.column || "unknown"}.`;
        break;
      case "42P01": // Undefined table
        statusCode = 500;
        message = "Database configuration error: Missing table. Run schema migrations.";
        break;
    }
  }

  // Log server-side exceptions (5xx errors)
  if (statusCode >= 500) {
    console.error(`[Server Error 500] Path: ${req.method} ${req.originalUrl}`);
    console.error("Payload:", req.body);
    console.error(err.stack || err);
  } else {
    console.warn(`[Client Error ${statusCode}] ${req.method} ${req.originalUrl} - ${message}`);
  }

  const isDev = process.env.NODE_ENV !== "production";

  res.status(statusCode).json({
    error: message,
    status: statusCode,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(isDev && {
      stack: err.stack,
      dbCode: err.code,
      detail: err.detail,
    }),
  });
};

/**
 * 404 Route Not Found Middleware.
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
    status: 404,
    timestamp: new Date().toISOString(),
  });
};
