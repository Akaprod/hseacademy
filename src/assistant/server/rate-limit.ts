// ============================================================================
// Rate Limiter — In-memory simple (pas de Redis, pas d'infra externe)
// ============================================================================
// Limite : 10 messages par minute par IP (identifiée par req.ip ou x-forwarded-for)
// Nettoyage automatique des entrées expirées toutes les 60 secondes.
// ============================================================================

interface RateEntry {
  timestamps: number[]; // tableau des timestamps de chaque message
}

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 messages par minute
const CLEANUP_INTERVAL_MS = 60_000; // nettoyage toutes les 60s

const rateStore = new Map<string, RateEntry>();
let lastCleanup = Date.now();

// === Vérifie si une IP peut envoyer un message ===
// Retourne { allowed: true } ou { allowed: false, retryAfter: ms }
export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();

  // Nettoyage périodique
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    for (const [key, entry] of rateStore) {
      entry.timestamps = entry.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
      if (entry.timestamps.length === 0) {
        rateStore.delete(key);
      }
    }
    lastCleanup = now;
  }

  const entry = rateStore.get(ip) || { timestamps: [] };

  // Nettoyer les timestamps expirés pour cette IP
  entry.timestamps = entry.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (entry.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
    return { allowed: false, retryAfter };
  }

  // Autoriser + enregistrer le timestamp
  entry.timestamps.push(now);
  rateStore.set(ip, entry);

  return { allowed: true };
}

// === Extrait l'IP depuis la requête ===
// Architecture Hostinger : Client → hcdn (CDN) → LiteSpeed (LSAPI) → Node.js
//
// Priorité (la plus fiable d'abord) :
//   1. x-real-ip        — set par le proxy (LiteSpeed), IP unique non-appendable par le client
//   2. x-client-ip      — set par certains CDN (incl. Hostinger hcdn)
//   3. cf-connecting-ip — set par Cloudflare (au cas où le CDN change)
//   4. x-forwarded-for  — LAST IP dans la liste (le plus proche de notre serveur = le plus fiable)
//   5. fallback 'unknown'
//
// ⚠️ On ne prend PAS le premier IP de x-forwarded-for car il peut être spoofé
// par le client (le client peut envoyer son propre header X-Forwarded-For).
export function getClientIP(req: Request): string {
  const headers = req.headers;

  // 1. x-real-ip — le plus fiable (IP unique, set par le proxy)
  const realIP = headers.get('x-real-ip');
  if (realIP) return sanitizeIP(realIP);

  // 2. x-client-ip — set par certains CDN
  const clientIP = headers.get('x-client-ip');
  if (clientIP) return sanitizeIP(clientIP);

  // 3. cf-connecting-ip — Cloudflare (future-proof)
  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP) return sanitizeIP(cfIP);

  // 4. x-forwarded-for — prendre le DERNIER IP (le plus proche de notre serveur)
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      // Dernier IP = celui ajouté par notre proxy direct (LiteSpeed)
      return sanitizeIP(parts[parts.length - 1]);
    }
  }

  // 5. Fallback
  return 'unknown';
}

// === Sanitise une IP — retire le port éventuel (ex: 1.2.3.4:8080 → 1.2.3.4) ===
// et valide le format de base (IPv4 ou IPv6 sans port).
function sanitizeIP(ip: string): string {
  const trimmed = ip.trim();

  // IPv4 avec port (ex: 192.168.1.1:8080)
  if (trimmed.includes('.')) {
    const colonIdx = trimmed.lastIndexOf(':');
    if (colonIdx > trimmed.indexOf('.')) {
      return trimmed.substring(0, colonIdx);
    }
  }

  // IPv6 avec port (ex: [::1]:8080)
  if (trimmed.startsWith('[')) {
    const closeBracket = trimmed.indexOf(']');
    if (closeBracket > 0) {
      return trimmed.substring(1, closeBracket);
    }
  }

  return trimmed;
}
