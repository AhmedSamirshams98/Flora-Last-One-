/* A small in-memory limiter for the routes that anyone (not signed in) may call: at most `max` calls
   per `windowMs` for one key (the visitor's address). It lives in the memory of one server process
   (with several pm2 instances each counts for itself), which is enough to stop a script that floods
   the guest order form; it is not a substitute for a firewall. */

type Bucket = { count: number; resetAt: number };
const g = globalThis as unknown as { __flora_rate?: Map<string, Bucket> };
const buckets = (g.__flora_rate ??= new Map());

export function rateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    // keep the map small
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= max) return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  b.count += 1;
  return { ok: true, retryAfter: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : req.headers.get("x-real-ip")) || "unknown";
}
