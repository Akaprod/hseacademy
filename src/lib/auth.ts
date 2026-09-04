import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from './db';

// ============================================================================
// AUTH_SECRET — obligatoire en production. Aucun fallback.
// Si absent ou trop court (<32 chars), crash explicite au boot.
// ============================================================================
const RAW_SECRET = process.env.AUTH_SECRET;

if (!RAW_SECRET || RAW_SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'FATAL: AUTH_SECRET manquant ou trop court (<32 chars) en production. ' +
      'Générer avec: openssl rand -hex 32, puis ajouter au .env.'
    );
  }
  console.warn('WARN: AUTH_SECRET absent en dev — utilisation d\'un secret éphémère non persistant.');
}

const SECRET = RAW_SECRET && RAW_SECRET.length >= 32
  ? RAW_SECRET
  : randomBytes(32).toString('hex'); // dev-only, régénéré à chaque boot

const COOKIE_NAME = 'iicp_session';
const MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 jours

// ============================================================================
// Session payload — minimaliste : seulement sub (userId) + exp.
// Le rôle n'est JAMAIS stocké dans le cookie.
// L'autorisation se fait en rechargant l'utilisateur depuis la DB à chaque
// requête protégée (requireAdmin / requireUser).
// ============================================================================
export interface SessionPayload {
  sub: string;        // userId
  exp: number;        // epoch secondes
}

// ============================================================================
// Sign / Verify (HMAC-SHA256, format: <base64url(payload)>.<hex(hmac)>)
// ============================================================================
function b64urlEncode(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function sign(payload: SessionPayload): string {
  const body = b64urlEncode(payload);
  const sig = createHmac('sha256', SECRET).update(body).digest('hex');
  return `${body}.${sig}`;
}

function verify(token: string): SessionPayload | null {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = createHmac('sha256', SECRET).update(body).digest('hex');
  const sigBuf = Buffer.from(sig, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf-8')
    ) as SessionPayload;
    if (typeof payload.exp !== 'number' || typeof payload.sub !== 'string') {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ============================================================================
// Cookie helpers
// ============================================================================
export async function setSessionCookie(userId: string): Promise<void> {
  const payload: SessionPayload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const c = await cookies();
  c.set(COOKIE_NAME, sign(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const c = await cookies();
  c.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// ============================================================================
// getSession — ne fait que vérifier la signature + expiration du cookie.
// Ne charge PAS l'utilisateur. Utilisé par /api/auth/me qui, lui, recharge
// depuis la DB.
// ============================================================================
export async function getSession(): Promise<SessionPayload | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verify(token);
}

// ============================================================================
// User type retourné par requireUser / requireAdmin (sans password)
// ============================================================================
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
}

// ============================================================================
// requireUser — authentification simple (n'importe quel user connecté)
// ============================================================================
export async function requireUser(): Promise<AuthUser | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Recharge depuis la DB : si l'user a été supprimé, la session est invalide
  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true, name: true, email: true, role: true,
      phone: true, avatar: true, bio: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 401 });
  }
  return user;
}

// ============================================================================
// requireAdmin — autorisation admin. DB = source d'autorité.
//
// Le rôle dans le cookie n'existe pas (payload = {sub, exp}).
// Même s'il existait, il ne serait PAS trusté.
//
// Étapes :
//   1. Vérifie la session (signature + expiration)
//   2. Si pas de session valide → 401
//   3. Recharge l'utilisateur depuis Prisma via session.sub
//   4. Si user introuvable en DB → 401 (user supprimé)
//   5. Vérifie user.role === 'admin' en DB
//   6. Si non admin → 403
//   7. Sinon retourne l'objet user (sans password)
// ============================================================================
export async function requireAdmin(): Promise<AuthUser | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Recharge systématique depuis la DB
  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true, name: true, email: true, role: true,
      phone: true, avatar: true, bio: true,
    },
  });

  // User supprimé en DB mais cookie encore valide → 401
  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 401 });
  }

  // Vérification du rôle ACTUEL en DB (jamais du cookie)
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  return user;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
