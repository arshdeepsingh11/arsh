/**
 * Sliding-window rate limiter keyed by client IP. In-memory, so limits are per server instance:
 * enough to stop one visitor hammering the model on a single Vercel function, not a global quota.
 * For a hard global limit, back this with Upstash Redis or Vercel KV (see README).
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): { ok: boolean; retryAfter: number } {
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  return { ok: true, retryAfter: 0 };
}

export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${scope}:${fwd || req.headers.get("x-real-ip") || "local"}`;
}

export function tooMany(retryAfter: number): Response {
  return Response.json({ error: "rate_limited", message: "Too many requests. Please wait a moment." }, { status: 429, headers: { "retry-after": String(retryAfter) } });
}
