/**
 * Custom API Error class.
 * Use this to trigger standard HTTP errors throughout the backend.
 */
export class ApiError extends Error {
  public statusCode: number;
  public isApiError: boolean;

  constructor(statusCode: number, message: string) {
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

export default ApiError;
