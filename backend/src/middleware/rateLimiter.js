/**
 * Custom in-memory rate-limiter middleware.
 * Restricts client IP requests over dynamic time windows.
 * NOTE: Storing metrics in-memory is process-local. Distributed deployment requires Redis.
 */
class InMemoryRateLimiter {
  constructor(windowMs, maxRequests, limitName = "API") {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.limitName = limitName;
    this.hits = new Map(); // ip -> [timestamps]
    
    // Automatic cleanup interval to prevent memory leaks (runs every 10 minutes)
    setInterval(() => {
      const now = Date.now();
      for (const [ip, timestamps] of this.hits.entries()) {
        const active = timestamps.filter(t => now - t < this.windowMs);
        if (active.length === 0) {
          this.hits.delete(ip);
        } else {
          this.hits.set(ip, active);
        }
      }
    }, 10 * 60 * 1000).unref();
  }

  getMiddleware() {
    return (req, res, next) => {
      const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const now = Date.now();

      if (!this.hits.has(ip)) {
        this.hits.set(ip, []);
      }

      const timestamps = this.hits.get(ip);
      
      // Filter out timestamps outside the active rate limit window
      const activeTimestamps = timestamps.filter(t => now - t < this.windowMs);
      
      if (activeTimestamps.length >= this.maxRequests) {
        console.warn(`[rateLimiter] IP ${ip} exceeded ${this.limitName} rate limit (${this.maxRequests} requests per ${this.windowMs / 1000}s).`);
        return res.status(429).json({
          error: `Too many requests for ${this.limitName} actions. Please wait before trying again.`
        });
      }

      // Record hit
      activeTimestamps.push(now);
      this.hits.set(ip, activeTimestamps);
      next();
    };
  }
}

// 1. General endpoints: 100 requests per 1 minute window
export const generalLimiter = new InMemoryRateLimiter(60 * 1000, 100, "General API").getMiddleware();

// 2. Strict resource endpoints (auth, query generation, execution, DB connection): 15 requests per 1 minute window
export const strictLimiter = new InMemoryRateLimiter(60 * 1000, 15, "Sensitive Action").getMiddleware();
