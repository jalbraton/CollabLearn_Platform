import { createClient } from 'redis';

// Initialize Redis client
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('error', (err: Error) => console.error('Redis Client Error', err));
redis.connect().catch(console.error);

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

/**
 * Get value from cache
 */
export async function getCache<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
  const { prefix = 'cache' } = options;
  const fullKey = `${prefix}:${key}`;

  try {
    const value = await redis.get(fullKey);
    if (!value) return null;

    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set value in cache
 */
export async function setCache<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<boolean> {
  const { ttl = 3600, prefix = 'cache' } = options;
  const fullKey = `${prefix}:${key}`;

  try {
    const serialized = JSON.stringify(value);

    if (ttl > 0) {
      await redis.setEx(fullKey, ttl, serialized);
    } else {
      await redis.set(fullKey, serialized);
    }

    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string, options: CacheOptions = {}): Promise<boolean> {
  const { prefix = 'cache' } = options;
  const fullKey = `${prefix}:${key}`;

  try {
    await redis.del(fullKey);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

/**
 * Delete multiple keys matching pattern
 */
export async function deleteCachePattern(
  pattern: string,
  options: CacheOptions = {}
): Promise<number> {
  const { prefix = 'cache' } = options;
  const fullPattern = `${prefix}:${pattern}`;

  try {
    const keys = await redis.keys(fullPattern);
    if (keys.length === 0) return 0;

    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error('Cache pattern delete error:', error);
    return 0;
  }
}

/**
 * Cached function wrapper
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions & {
    keyGenerator: (...args: Parameters<T>) => string;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const key = options.keyGenerator(...args);
    
    // Try to get from cache
    const cached = await getCache(key, options);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn(...args);

    // Store in cache
    await setCache(key, result, options);

    return result;
  }) as T;
}

/**
 * Cache manager for specific entities
 */
export class CacheManager {
  constructor(private prefix: string, private defaultTTL: number = 3600) {}

  async get<T>(id: string): Promise<T | null> {
    return getCache<T>(id, { prefix: this.prefix, ttl: this.defaultTTL });
  }

  async set<T>(id: string, value: T, ttl?: number): Promise<boolean> {
    return setCache(id, value, {
      prefix: this.prefix,
      ttl: ttl || this.defaultTTL,
    });
  }

  async delete(id: string): Promise<boolean> {
    return deleteCache(id, { prefix: this.prefix });
  }

  async deleteAll(): Promise<number> {
    return deleteCachePattern('*', { prefix: this.prefix });
  }

  async invalidatePattern(pattern: string): Promise<number> {
    return deleteCachePattern(pattern, { prefix: this.prefix });
  }
}

// Predefined cache managers
export const workspaceCache = new CacheManager('workspace', 3600); // 1 hour
export const pageCache = new CacheManager('page', 1800); // 30 minutes
export const userCache = new CacheManager('user', 7200); // 2 hours
export const analyticsCache = new CacheManager('analytics', 300); // 5 minutes
