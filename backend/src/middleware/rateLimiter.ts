import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { error: 'Too many login attempts, please try again later' },
  skipSuccessfulRequests: true
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests' }
});

export const socketLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: { error: 'Message rate limit exceeded' }
});