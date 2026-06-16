import rateLimit from 'express-rate-limit';

// Standard rate limiter for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for compiler execution or AI queries
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 compiler runs or AI evaluations per minute
  message: {
    message: 'Rate limit exceeded for intensive requests. Please wait a minute before retrying.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
