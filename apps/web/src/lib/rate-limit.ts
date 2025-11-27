import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

// Initialize Redis client
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.connect().catch(console.error);

export interface RateLimitConfig {
  interval: number; // Time window in seconds
  maxRequests: number; // Maximum requests per interval
  identifier?: string; // Optional custom identifier
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limiting middleware using Redis
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { interval, maxRequests, identifier } = config;

  // Get identifier (IP address or custom identifier)
  const ip = identifier || request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
  const key = `ratelimit:${ip}:${request.nextUrl.pathname}`;

  try {
    // Get current count
    const count = await redis.incr(key);
    
    // Set expiry on first request
    if (count === 1) {
      await redis.expire(key, interval);
    }

    // Get TTL
    const ttl = await redis.ttl(key);

    const remaining = Math.max(0, maxRequests - count);
    const reset = Date.now() + (ttl > 0 ? ttl * 1000 : interval * 1000);

    return {
      success: count <= maxRequests,
      limit: maxRequests,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow request if Redis is down
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests,
      reset: Date.now() + interval * 1000,
    };
  }
}

/**
 * Rate limit middleware wrapper for API routes
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async (req: NextRequest) => {
    const result = await rateLimit(req, config);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = await handler(req);
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.reset.toString());

    return response;
  };
}

/**
 * Preset rate limit configurations
 */
export const rateLimitPresets = {
  // Strict rate limit for authentication endpoints
  auth: {
    interval: 900, // 15 minutes
    maxRequests: 5,
  },
  
  // Normal rate limit for API endpoints
  api: {
    interval: 60, // 1 minute
    maxRequests: 60,
  },
  
  // Relaxed rate limit for read operations
  read: {
    interval: 60, // 1 minute
    maxRequests: 120,
  },
  
  // Very strict for sensitive operations
  sensitive: {
    interval: 3600, // 1 hour
    maxRequests: 10,
  },
  
  // File upload limits
  upload: {
    interval: 300, // 5 minutes
    maxRequests: 10,
  },
};

/**
 * Check if IP is in blocklist
 */
export async function isBlocked(ip: string): Promise<boolean> {
  try {
    const blocked = await redis.get(`blocklist:${ip}`);
    return blocked === '1';
  } catch (error) {
    console.error('Error checking blocklist:', error);
    return false;
  }
}

/**
 * Add IP to blocklist
 */
export async function blockIP(ip: string, duration: number = 86400): Promise<void> {
  try {
    await redis.setEx(`blocklist:${ip}`, duration, '1');
  } catch (error) {
    console.error('Error blocking IP:', error);
  }
}

/**
 * Remove IP from blocklist
 */
export async function unblockIP(ip: string): Promise<void> {
  try {
    await redis.del(`blocklist:${ip}`);
  } catch (error) {
    console.error('Error unblocking IP:', error);
  }
}
