// ============================================================================
// Quota Service — Comptage et contrôle des quotas de messages
// ============================================================================
// Logique:
//   - Visiteur (non connecté): identifié par cookie 'lara_visitor_id' (UUID)
//     Comptage via table AssistantVisitorQuota (1 row par visitorId)
//   - Utilisateur connecté: comptage via assistant_message JOIN assistant_conversation
//     WHERE userId = X AND role = 'user' AND createdAt > windowStart
//   - Admin: illimité (pas de comptage)
//
// Sécurité:
//   - Le visitorId est généré côté serveur (randomUUID) et stocké dans un
//     cookie HttpOnly (JavaScript ne peut pas le lire ni le modifier)
//   - Le comptage est TOUJOURS côté serveur
//   - Le frontend ne décide JAMAIS du quota
// ============================================================================

import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import type { AssistantConfigData } from '../types';

const VISITOR_COOKIE_NAME = 'lara_visitor_id';
const VISITOR_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  userType: 'visitor' | 'user' | 'admin';
  visitorId?: string;
}

// === Get or create visitor ID from cookie ===
export async function getOrCreateVisitorId(): Promise<string> {
  const c = await cookies();
  let visitorId = c.get(VISITOR_COOKIE_NAME)?.value;

  if (!visitorId || visitorId.length < 10) {
    // Generate new visitor ID
    visitorId = randomUUID();
    c.set(VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: VISITOR_COOKIE_MAX_AGE,
      path: '/',
    });
  }

  return visitorId;
}

// === Check quota for a user/visitor ===
export async function checkQuota(
  config: AssistantConfigData,
  userAuth: { id: string; role: string } | null,
  visitorId?: string
): Promise<QuotaCheckResult> {
  // Admin = unlimited
  if (userAuth && userAuth.role === 'admin') {
    return { allowed: true, remaining: Infinity, limit: 0, userType: 'admin' };
  }

  const periodMs = (config.messageLimitPeriodHours || 24) * 60 * 60 * 1000;
  const windowStart = new Date(Date.now() - periodMs);

  // Logged-in user: count messages via DB
  if (userAuth) {
    const limit = config.userMessageLimit || 60;
    try {
      const count = await countUserMessages(userAuth.id, windowStart);
      const remaining = Math.max(0, limit - count);
      return {
        allowed: count < limit,
        remaining,
        limit,
        userType: 'user',
      };
    } catch (error: any) {
      console.error('[quota] Failed to count user messages:', error?.message);
      // Graceful: allow on error (don't block users if DB fails)
      return { allowed: true, remaining: limit, limit, userType: 'user' };
    }
  }

  // Visitor: count via AssistantVisitorQuota table
  const limit = config.visitorMessageLimit || 20;
  if (!visitorId) {
    // No visitor ID → allow (will be created on first request)
    return { allowed: true, remaining: limit, limit, userType: 'visitor' };
  }

  try {
    const quota = await db.assistantVisitorQuota.findUnique({
      where: { visitorId },
    });

    if (!quota) {
      // First message — create entry
      return { allowed: true, remaining: limit, limit, userType: 'visitor', visitorId };
    }

    // Check if window expired → reset
    const windowExpired = quota.windowStart.getTime() + periodMs < Date.now();
    if (windowExpired) {
      // Reset: new window, count = 0
      return { allowed: true, remaining: limit, limit, userType: 'visitor', visitorId };
    }

    const remaining = Math.max(0, limit - quota.messageCount);
    return {
      allowed: quota.messageCount < limit,
      remaining,
      limit,
      userType: 'visitor',
      visitorId,
    };
  } catch (error: any) {
    console.error('[quota] Failed to check visitor quota:', error?.message);
    // Graceful: allow on error
    return { allowed: true, remaining: limit, limit, userType: 'visitor', visitorId };
  }
}

// === Increment quota after a message is sent ===
export async function incrementQuota(
  config: AssistantConfigData,
  userAuth: { id: string; role: string } | null,
  visitorId?: string
): Promise<void> {
  // Admin = no increment
  if (userAuth && userAuth.role === 'admin') return;

  const periodMs = (config.messageLimitPeriodHours || 24) * 60 * 60 * 1000;

  // Visitor: increment in AssistantVisitorQuota
  if (!userAuth && visitorId) {
    try {
      const existing = await db.assistantVisitorQuota.findUnique({
        where: { visitorId },
      });

      if (!existing) {
        // Create new entry
        await db.assistantVisitorQuota.create({
          data: {
            visitorId,
            messageCount: 1,
            windowStart: new Date(),
            lastMessageAt: new Date(),
          },
        });
      } else {
        // Check if window expired → reset
        const windowExpired = existing.windowStart.getTime() + periodMs < Date.now();
        if (windowExpired) {
          await db.assistantVisitorQuota.update({
            where: { visitorId },
            data: {
              messageCount: 1,
              windowStart: new Date(),
              lastMessageAt: new Date(),
            },
          });
        } else {
          // Increment
          await db.assistantVisitorQuota.update({
            where: { visitorId },
            data: {
              messageCount: { increment: 1 },
              lastMessageAt: new Date(),
            },
          });
        }
      }
    } catch (error: any) {
      console.error('[quota] Failed to increment visitor quota:', error?.message);
    }
  }
  // For logged-in users: messages are already counted via assistant_message table
  // (each user message is stored in assistant_message with conversationId → userId)
}

// === Count user messages in the last N hours ===
async function countUserMessages(userId: string, since: Date): Promise<number> {
  try {
    const count = await db.assistantMessage.count({
      where: {
        role: 'user',
        conversation: { userId },
        createdAt: { gt: since },
      },
    });
    return count;
  } catch {
    return 0; // graceful
  }
}

// === Quota exceeded messages (server-controlled, NOT LLM-generated) ===
export function getQuotaExceededMessage(userType: 'visitor' | 'user', remaining: number): string {
  if (userType === 'visitor') {
    return "Vous avez atteint votre limite de messages en tant que visiteur. Créez gratuitement votre compte pour continuer votre conversation avec Lara et accéder à davantage d'informations.";
  }
  return "Vous avez atteint votre limite de messages pour cette période. Votre quota sera réinitialisé prochainement. Revenez plus tard pour continuer votre conversation.";
}
