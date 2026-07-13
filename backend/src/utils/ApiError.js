/**
 * Custom API Error class.
 * Use this to trigger standard HTTP errors throughout the backend.
 *
 * @example
 * throw ApiError.badRequest("Invalid email format");
 * throw new ApiError(402, "Payment required");
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g., 400, 401, 500)
   * @param {string} message - Human-readable error message sent to the client
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isApiError = true;
  }

  static badRequest(msg = "Bad Request") {
    return new ApiError(400, msg);
  }

  static unauthorized(msg = "Unauthorized") {
    return new ApiError(401, msg);
  }

  static forbidden(msg = "Forbidden") {
    return new ApiError(403, msg);
  }

  static notFound(msg = "Not Found") {
    return new ApiError(404, msg);
  }

  static conflict(msg = "Conflict") {
    return new ApiError(409, msg);
  }

  static unprocessableEntity(msg = "Unprocessable Entity") {
    return new ApiError(422, msg);
  }

  static tooManyRequests(msg = "Too Many Requests") {
    return new ApiError(429, msg);
  }

  static internalServer(msg = "Internal Server Error") {
    return new ApiError(500, msg);
  }
}

module.exports = ApiError;
