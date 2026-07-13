/**
 * Wraps async Express controllers to automatically catch unhandled promise rejections
 * and forward them to the global Express error handler via `next()`.
 *
 * This completely eliminates the need to write standard `try / catch` blocks
 * inside every single controller function.
 *
 * @example
 * app.get('/users', asyncHandler(async (req, res) => {
 *   const users = await db.getUsers(); // Errors bubble up automatically
 *   res.json(users);
 * }));
 *
 * @param {Function} fn - The asynchronous route handler function
 * @returns {import('express').RequestHandler}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
