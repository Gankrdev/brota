// In-memory rate limiter — resets on server restart (sufficient for a 2-user app on Vercel serverless).
// Each entry: { count, windowStart }

const store = new Map<string, { count: number; windowStart: number }>();

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(key: string, { maxRequests, windowMs }: RateLimitOptions): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
}
