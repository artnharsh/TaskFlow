import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps async Express controllers to automatically catch unhandled promise rejections.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
