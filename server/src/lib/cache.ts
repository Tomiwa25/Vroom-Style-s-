import { Redis } from "ioredis";

export interface ICacheDriver {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
  clear(): Promise<void>;
  getName(): string;
}

interface MemoryCacheEntry {
  value: string;
  expiresAt: number | null;
}

/**
 * High-performance, bounded Node.js In-Memory Cache Driver.
 * Zero external dependencies, automatic TTL eviction, and memory bounding.
 */
export class MemoryCacheDriver implements ICacheDriver {
  private store = new Map<string, MemoryCacheEntry>();
  private readonly maxEntries: number;

  constructor(maxEntries = 1000) {
    this.maxEntries = maxEntries;
  }

  getName(): string {
    return "memory";
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    try {
      return JSON.parse(entry.value) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    // Memory bounding: Evict oldest keys if capacity reached
    if (this.store.size >= this.maxEntries) {
      const keysToEvict = Array.from(this.store.keys()).slice(0, 50);
      keysToEvict.forEach((k) => this.store.delete(k));
    }

    const serialized = JSON.stringify(value);
    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;

    this.store.set(key, { value: serialized, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    // Converts wildcard pattern like "products:*" to regular expression
    const regexPattern = "^" + pattern.replace(/\*/g, ".*") + "$";
    const regex = new RegExp(regexPattern);

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

/**
 * Distributed Redis Cache Driver with automatic fallback to MemoryCacheDriver.
 */
export class RedisCacheDriver implements ICacheDriver {
  private client: Redis | null = null;
  private isAvailable = false;
  private memoryFallback: MemoryCacheDriver;
  private hasLoggedWarning = false;

  constructor() {
    this.memoryFallback = new MemoryCacheDriver();
    this.initClient();
  }

  private initClient(): void {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST || "localhost";
    const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
    const redisPassword = process.env.REDIS_PASSWORD || undefined;

    try {
      const client = redisUrl
        ? new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            retryStrategy: (times) => {
              if (times > 2) return null;
              return Math.min(times * 100, 1000);
            },
          })
        : new Redis({
            host: redisHost,
            port: redisPort,
            password: redisPassword,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            retryStrategy: (times) => {
              if (times > 2) return null;
              return Math.min(times * 100, 1000);
            },
          });

      client.on("connect", () => {
        this.isAvailable = true;
        console.log("[Cache] Redis cache driver connected successfully");
      });

      client.on("error", (err) => {
        this.isAvailable = false;
        if (!this.hasLoggedWarning) {
          this.hasLoggedWarning = true;
          console.warn(`[Cache] Redis is unreachable (${err.message}). Seamlessly falling back to Node.js in-memory caching.`);
        }
      });

      this.client = client;
    } catch (err) {
      console.warn("[Cache] Failed to initialize Redis client. Using in-memory fallback:", err);
    }
  }

  getName(): string {
    return this.isAvailable ? "redis" : "memory (redis fallback)";
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isAvailable) {
      return this.memoryFallback.get<T>(key);
    }

    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      return this.memoryFallback.get<T>(key);
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.client || !this.isAvailable) {
      return this.memoryFallback.set(key, value, ttlSeconds);
    }

    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      await this.memoryFallback.set(key, value, ttlSeconds);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.client || !this.isAvailable) {
      return this.memoryFallback.delete(key);
    }

    try {
      await this.client.del(key);
    } catch {
      await this.memoryFallback.delete(key);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.client || !this.isAvailable) {
      return this.memoryFallback.deletePattern(pattern);
    }

    try {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await this.client.scan(cursor, "MATCH", pattern, "COUNT", 50);
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== "0");
    } catch {
      await this.memoryFallback.deletePattern(pattern);
    }
  }

  async clear(): Promise<void> {
    if (!this.client || !this.isAvailable) {
      return this.memoryFallback.clear();
    }

    try {
      await this.client.flushdb();
    } catch {
      await this.memoryFallback.clear();
    }
  }
}

/**
 * Cache Manager Factory
 * Dynamically selects Cache Driver based on process.env.CACHE_DRIVER ('memory' | 'redis')
 */
let activeDriver: ICacheDriver | null = null;

export const getCacheDriver = (): ICacheDriver => {
  if (!activeDriver) {
    const configuredDriver = (process.env.CACHE_DRIVER || "memory").toLowerCase().trim();

    if (configuredDriver === "redis") {
      activeDriver = new RedisCacheDriver();
    } else {
      activeDriver = new MemoryCacheDriver();
      console.log("[Cache] Using Node.js bound in-memory cache driver (CACHE_DRIVER=memory)");
    }
  }
  return activeDriver;
};

// Unified exports for services
export const getCache = async <T>(key: string): Promise<T | null> => {
  return getCacheDriver().get<T>(key);
};

export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds: number = 300
): Promise<void> => {
  return getCacheDriver().set(key, value, ttlSeconds);
};

export const deleteCache = async (key: string): Promise<void> => {
  return getCacheDriver().delete(key);
};

export const deleteCachePattern = async (pattern: string): Promise<void> => {
  return getCacheDriver().deletePattern(pattern);
};

export const getActiveCacheDriverName = (): string => {
  return getCacheDriver().getName();
};
