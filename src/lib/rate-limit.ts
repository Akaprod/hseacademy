// ============================================================================
// Rate limiting helper — IP-based, in-memory, simple
// ============================================================================
// Pour HSE Academy (faible volume), un rate limit en mémoire suffisant.
// Pour production à grande échelle, utiliser Redis.
// ============================================================================

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();

export function checkIpRateLimit(
  clientIP: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(clientIP);

  if (entry && entry.resetAt > now) {
    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
    }
    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count, retryAfterMs: 0 };
  }

  // Nouvelle fenêtre
  RATE_LIMIT_MAP.set(clientIP, { count: 1, resetAt: now + windowMs });

  // Cleanup occasionnel des entrées expirées
  if (Math.random() < 0.1) {
    for (const [ip, e] of RATE_LIMIT_MAP) {
      if (e.resetAt < now) RATE_LIMIT_MAP.delete(ip);
    }
  }

  return { allowed: true, remaining: maxRequests - 1, retryAfterMs: 0 };
}

export function getClientIP(req: { headers: { get: (name: string) => string | null } }): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
