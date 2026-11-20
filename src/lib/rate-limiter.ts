/**
 * In-Memory Sliding-Window Rate Limiter
 * Provides thread-safe, memory-bounded rate limiting for authentication
 * and high-risk API operations.
 */

interface RateLimitRecord {
  timestamps: number[];
  blockedUntil?: number;
}

class RateLimiter {
  private records = new Map<string, RateLimitRecord>();
  private readonly cleanupIntervalMs: number;

  constructor(cleanupIntervalMs = 60000) {
    this.cleanupIntervalMs = cleanupIntervalMs;

    // Periodic garbage collection of expired buckets
    if (typeof setInterval !== "undefined") {
      const interval = setInterval(() => this.cleanup(), this.cleanupIntervalMs);
      if (typeof interval === "object" && "unref" in interval) {
        interval.unref();
      }
    }
  }

  /**
   * Check and record an attempt.
   * @param key Unique identifier (e.g. `login:${ip}:${email}`)
   * @param maxAttempts Max allowed attempts within the window
   * @param windowMs Time window in milliseconds
   * @param blockDurationMs Optional duration to block if limit exceeded
   */
  public check(
    key: string,
    maxAttempts: number,
    windowMs: number,
    blockDurationMs = 0
  ): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const now = Date.now();
    let record = this.records.get(key);

    if (!record) {
      record = { timestamps: [] };
      this.records.set(key, record);
    }

    // Check if currently blocked
    if (record.blockedUntil && record.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: record.blockedUntil - now,
      };
    }

    // Filter out timestamps outside the sliding window
    const windowStart = now - windowMs;
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= maxAttempts) {
      if (blockDurationMs > 0) {
        record.blockedUntil = now + blockDurationMs;
      }
      const oldest = record.timestamps[0] || now;
      const retryAfterMs = blockDurationMs > 0 ? blockDurationMs : oldest + windowMs - now;
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(0, retryAfterMs),
      };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      remaining: maxAttempts - record.timestamps.length,
      retryAfterMs: 0,
    };
  }

  /**
   * Reset rate limit state for a key (e.g. after successful login)
   */
  public reset(key: string): void {
    this.records.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      // Retain only if blocked or has recent timestamps
      const hasRecent = record.timestamps.some((ts) => now - ts < 3600000);
      const isBlocked = record.blockedUntil && record.blockedUntil > now;
      if (!hasRecent && !isBlocked) {
        this.records.delete(key);
      }
    }
  }
}

// Global singleton instance
declare global {
  // eslint-disable-next-line no-var
  var globalRateLimiter: RateLimiter | undefined;
}

export const rateLimiter = global.globalRateLimiter || new RateLimiter();
if (process.env.NODE_ENV !== "production") {
  global.globalRateLimiter = rateLimiter;
}

