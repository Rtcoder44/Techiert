const rateLimit = require("express-rate-limit");

const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // default 15 minutes
    max: options.max || 100, // default 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: options.message || {
      success: false,
      error: "Too many requests. Please try again later.",
    },
    keyGenerator: options.keyGenerator || ((req) => {
      // Prefer user ID if available, otherwise fallback to IP address
      return req.user?.id || req.ip;
    }),
  });
};

module.exports = createRateLimiter;
