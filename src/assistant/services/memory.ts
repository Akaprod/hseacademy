// ============================================================================
// Service — Mémoire conversationnelle (Phase 3 — persistence réelle)
// ============================================================================
// Utilise AssistantConversation + AssistantMessage (modèles déjà en DB).
//
// Règles :
// - Visiteur (non authentifié) : pas de persistance (mémoire session-only)
// - Utilisateur authentifié : conversation persistée, liée à userId
// - Limite : on renvoie les 10 derniers messages (pas tout l'historique)
// ============================================================================

import { db } from '@/lib/db';
import type { AssistantMessage, AssistantMode, AssistantConversationData } from '../types';

// === Créer ou récupérer une conversation ===
// Visiteurs : retourne null (pas de persistance)
// Users : crée ou retrouve la conversation la plus récente pour ce mode
export async function getOrCreateConversation(
  userId: string | null,
  mode: AssistantMode,
  conversationId?: string
): Promise<string | null> {
  // Pas de persistance pour les visiteurs
  if (!userId) return null;

  try {
    // Si un conversationId est fourni, vérifier qu'il appartient au user
    if (conversationId) {
      const existing = await db.assistantConversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (existing) return existing.id;
    }

    // Chercher une conversation récente pour ce user + mode (moins de 30 min)
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recent = await db.assistantConversation.findFirst({
      where: {
        userId,
        mode,
        updatedAt: { gt: thirtyMinAgo },
      },
      orderBy: { updatedAt: 'desc' },
    });
    if (recent) return recent.id;

    // Sinon, créer une nouvelle conversation
    const created = await db.assistantConversation.create({
      data: { userId, mode },
    });
    return created.id;
  } catch (error) {
    console.error('[assistant/memory] getOrCreateConversation error:', error);
    return null; // graceful degradation — pas de mémoire si DB indisponible
  }
}

// === Ajouter un message à la conversation ===
export async function appendMessage(
  conversationId: string | null,
  message: AssistantMessage
): Promise<void> {
  if (!conversationId) return; // pas de persistance (visiteur)
  try {
    await db.assistantMessage.create({
      data: {
        conversationId,
        role: message.role,
        content: message.content,
        mode: message.mode || 'commercial',
      },
    });
    // Mettre à jour le timestamp de la conversation
    await db.assistantConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  } catch (error) {
    console.error('[assistant/memory] appendMessage error:', error);
    // Silent — la conversation continue même si la persistance échoue
  }
}

// === Récupérer les N derniers messages (pour le contexte du LLM) ===
// Limite stricte : 10 messages maximum (anti token-bloat)
export async function getRecentMessages(
  conversationId: string | null,
  limit: number = 10
): Promise<AssistantMessage[]> {
  if (!conversationId) return []; // visiteur → pas d'historique

  try {
    const messages = await db.assistantMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Inverser pour avoir l'ordre chronologique
    return messages.reverse().map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
      mode: m.mode as AssistantMode,
      createdAt: m.createdAt?.toISOString?.() ?? undefined,
    }));
  } catch (error) {
    console.error('[assistant/memory] getRecentMessages error:', error);
    return []; // graceful degradation
  }
}

// === Lister les conversations d'un utilisateur (future dashboard) ===
export async function listConversations(
  userId: string
): Promise<AssistantConversationData[]> {
  try {
    const conversations = await db.assistantConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
    return conversations.map(c => ({
      id: c.id,
      userId: c.userId,
      mode: c.mode as AssistantMode,
      title: c.title,
      createdAt: c.createdAt?.toISOString?.() ?? '',
      updatedAt: c.updatedAt?.toISOString?.() ?? '',
    }));
  } catch (error) {
    console.error('[assistant/memory] listConversations error:', error);
    return [];
  }
}
