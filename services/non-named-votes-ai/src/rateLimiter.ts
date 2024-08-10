// set up rate limiter: maximum of five requests per minute
import RateLimit from 'express-rate-limit';
export const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});
