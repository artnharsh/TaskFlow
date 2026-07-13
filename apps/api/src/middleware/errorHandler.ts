import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode || 500;

  if (status >= 500) {
    console.error("[Server Error]", err);
  }

  if (err.code === "23505") {
    return res.status(409).json({ error: "Resource already exists", status: 409 });
  }

  res.status(status).json({
    error: status >= 500 ? "Internal server error" : err.message,
    status: status,
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: "Resource not found", status: 404 });
};
