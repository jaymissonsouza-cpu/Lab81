import "server-only";

/** Limitador simples em memória (por processo). Suficiente para um único servidor Node na VPS. */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return { ok: true, retryAfter: 0 };
  }
  b.count++;
  if (b.count > limit) return { ok: false, retryAfter: Math.ceil((b.reset - now) / 1000) };
  return { ok: true, retryAfter: 0 };
}

export function clientIp(headers: Headers) {
  return (headers.get("x-forwarded-for")?.split(",")[0] || headers.get("x-real-ip") || "local").trim();
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
