const buckets = new Map<string, { count: number; resetAt: number }>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function getClientIp(request: { headers: Headers }): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return forwarded || "unknown";
}

export function consumeRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    pruneExpiredBuckets(now);
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterSeconds: 0 };
  }

  current.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  return {
    allowed: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    retryAfterSeconds,
  };
}

function pruneExpiredBuckets(now: number) {
  if (buckets.size < 1_000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
