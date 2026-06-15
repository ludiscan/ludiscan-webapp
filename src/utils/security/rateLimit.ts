import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Simple in-memory rate limiter for API routes
 *
 * NOTE: This is a basic implementation suitable for single-server deployments.
 * For production with multiple servers, consider using Redis-based rate limiting.
 *
 * Implements a sliding window algorithm to track request counts per IP address.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limit tracking
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 60 seconds to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Bucket identifier — isolates this endpoint group's counter from others sharing the same IP */
  name: string;
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Custom key generator (defaults to IP address) */
  keyGenerator?: (req: NextApiRequest) => string;
}

/**
 * Default rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  /** Strict limit for authentication endpoints (5 requests per minute) */
  AUTH: { name: 'auth', maxRequests: 5, windowSeconds: 60 },
  /** Moderate limit for API endpoints (30 requests per minute) */
  API: { name: 'api', maxRequests: 30, windowSeconds: 60 },
  /** Generous limit for read-only endpoints (100 requests per minute) */
  READ_ONLY: { name: 'read_only', maxRequests: 100, windowSeconds: 60 },
} as const;

/**
 * Get client IP address from request
 * Handles various proxy headers (X-Forwarded-For, X-Real-IP)
 * @param req - Next.js API request
 * @returns Client IP address
 */
function getClientIp(req: NextApiRequest): string {
  // Amplify/CloudFront forwards the chain as `client, proxy1, proxy2, ...` in X-Forwarded-For,
  // so the first non-empty entry is the original client IP. Skip blank segments defensively.
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const first = raw
      .split(',')
      .map((part) => part.trim())
      .find((part) => part.length > 0);
    if (first) return first;
  }

  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    const ip = (Array.isArray(realIp) ? realIp[0] : realIp).trim();
    if (ip) return ip;
  }

  // Fallback to socket address
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Check if request is rate limited
 * @param req - Next.js API request
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  req: NextApiRequest,
  config: RateLimitConfig,
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  // Prefix the key with the bucket name so endpoints with different limits don't share one
  // counter — otherwise a login (limit 5) gets rejected because read-only/API routes from the
  // same IP already filled the window.
  const identity = config.keyGenerator ? config.keyGenerator(req) : getClientIp(req);
  const key = `${config.name}:${identity}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = rateLimitStore.get(key);

  // Create new entry or reset if window has passed
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, entry);
  }

  // Increment request count
  entry.count++;

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = entry.count <= config.maxRequests;

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Rate limit middleware for API routes
 * Returns 429 Too Many Requests if limit is exceeded
 * @param config - Rate limit configuration
 * @returns Middleware function that can be used in API routes
 *
 * @example
 * ```typescript
 * export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   const rateLimitResult = await rateLimitMiddleware(RATE_LIMITS.AUTH)(req, res);
 *   if (!rateLimitResult.allowed) return; // Response already sent
 *
 *   // Your API logic here
 * }
 * ```
 */
export function rateLimitMiddleware(config: RateLimitConfig) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const result = checkRateLimit(req, config);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter || config.windowSeconds);
      res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
      });
      return { allowed: false };
    }

    return { allowed: true };
  };
}
