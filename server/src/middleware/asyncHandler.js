/**
 * Wrapper to catch asynchronous errors in Express route handlers and controllers
 * and forward them to the global error handling middleware.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
