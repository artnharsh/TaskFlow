/**
 * Global error handling middleware for Express.
 * Catches all thrown ApiErrors and unhandled exceptions, and formats them
 * into a standardized JSON response for the frontend client.
 *
 * It automatically scrubs sensitive 500 error messages to prevent leakage.
 *
 * @param {Error} err - The error object
 * @param {import('express').Request} _req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} _next - Express next function
 */
const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || 500;

  // Log critical server errors to the console
  if (status >= 500) {
    console.error("[Server Error]", err);
  }

  // Handle unique constraint violations from PostgreSQL natively
  if (err.code === "23505") {
    return res.status(409).json({ error: "Resource already exists" });
  }

  // Standardize the response payload
  res.status(status).json({
    error: status >= 500 ? "Internal server error" : err.message,
    status: status,
  });
};

/**
 * Middleware to catch all unmatched routes and return a clean 404 response.
 */
const notFoundHandler = (_req, res) => {
  res.status(404).json({ error: "Resource not found", status: 404 });
};

module.exports = { errorHandler, notFoundHandler };
