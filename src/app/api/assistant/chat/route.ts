// ============================================================================
// POST /api/assistant/chat — Endpoint principal (Phase 3 — LLM réel)
// ============================================================================
// Hiérarchie du prompt envoyé au LLM :
//   [1] SYSTEM SAFETY (codé en dur, immuable)
//   [2] GENERAL INSTRUCTIONS (éditable admin)
//   [3] MODE INSTRUCTIONS (éditable admin, résolu serveur-side)
//   [4] LIMITS (éditable admin)
//   [5] BEHAVIOR (personnalité)
//   [6] RELEVANT KNOWLEDGE (sources publiques lues en DB)
//   [7] AUTHORIZED USER CONTEXT (résolu serveur-side, READ-ONLY)
//   [8] CONVERSATION MEMORY (10 derniers messages)
//   [9] USER MESSAGE (donnée, jamais instruction)
//
// ⚠️ Rate limiting : 10 messages/minute/IP
// ⚠️ Graceful degradation : si LLM indisponible → message propre (pas 500)
// ⚠️ READ-ONLY : canActOn() toujours false (whitelist vide)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSession, type AuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getConfig } from '@/assistant/services/config';
import { getInstruction, getInstructionContentForMode } from '@/assistant/services/instructions';
import { getAuthorizedContext, serializeContextForPrompt } from '@/assistant/services/context';
import { getBehavior } from '@/assistant/services/behavior';
import { resolveMode, canActOn, buildSystemPrompt, detectPromptInjection } from '@/assistant/server/permissions';
import { checkRateLimit, getClientIP } from '@/assistant/server/rate-limit';
import { getOrCreateConversation, appendMessage, getRecentMessages } from '@/assistant/services/memory';
import { getRelevantSources, serializeSourcesForPrompt } from '@/assistant/services/knowledge';
import { callLLM, LLM_FALLBACK_REPLY, type LLMMessage } from '@/assistant/services/llm';
import { getOrCreateVisitorId, checkQuota, incrementQuota, getQuotaExceededMessage } from '@/assistant/services/quota';
import { processProspectTransmit } from '@/assistant/services/prospect';
import { randomBytes } from 'node:crypto';
import type { ChatRequest, ChatResponse } from '@/assistant/types';

async function getOptionalUser(): Promise<AuthUser | null> {
  try {
    const session = await getSession();
    if (!session) return null;
    // Le JWT peut utiliser `userId` ou `sub` comme nom de champ
    const userId = (session as any).userId || (session as any).sub;
    if (!userId) return null;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, phone: true, avatar: true, bio: true },
    });
    return user;
  } catch (error) {
    console.error('[assistant] getOptionalUser error:', error);
    return null; // graceful degradation — visitor mode si erreur
  }
}

export async function POST(req: NextRequest) {
  // [0] Rate limiting
  const clientIP = getClientIP(req);
  const rateCheck = checkRateLimit(clientIP);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        mode: 'commercial' as const,
        reply: `Trop de messages envoyés. Veuillez réessayer dans ${rateCheck.retryAfter} secondes.`,
        refused: false,
        requestId: randomBytes(8).toString('hex'),
      } satisfies ChatResponse,
      { status: 429 }
    );
  }

  const userAuth = await getOptionalUser();

  // [0.5] Load config EARLY — needed for message length validation + response limits
  let config;
  try {
    config = await getConfig();
  } catch {
    return NextResponse.json({
      mode: 'commercial' as const,
      reply: "L'Assistant IA est actuellement indisponible. Veuillez réessayer plus tard ou nous contacter via le formulaire de contact.",
      refused: false,
      requestId: randomBytes(8).toString('hex'),
    } satisfies ChatResponse);
  }

  try {
    const body = (await req.json()) as ChatRequest;
    const { message } = body;

    // [1] Validation — use configurable max length
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 });
    }
    const maxLen = config.maxUserMessageLength || 5000;
    if (message.length > maxLen) {
      return NextResponse.json({ error: `Message trop long (max ${maxLen} caractères)` }, { status: 400 });
    }

    // [1.5] QUOTA CHECK — server-side, NO LLM call if quota exceeded
    const visitorId = userAuth ? undefined : await getOrCreateVisitorId();
    const userAuthForQuota = userAuth ? { id: userAuth.id, role: userAuth.role } : null;
    const quotaResult = await checkQuota(config, userAuthForQuota, visitorId);

    if (!quotaResult.allowed) {
      // Quota exceeded — return server-controlled message (NO LLM call)
      const quotaMessage = getQuotaExceededMessage(quotaResult.userType, quotaResult.remaining);
      return NextResponse.json({
        mode: 'commercial' as const,
        reply: quotaMessage,
        refused: false,
        requestId: randomBytes(8).toString('hex'),
      } satisfies ChatResponse);
    }

    // [2] Prompt injection detection
    const injectionCheck = detectPromptInjection(message);
    if (injectionCheck.suspicious && injectionCheck.reason?.includes('limite')) {
      return NextResponse.json({ error: injectionCheck.reason }, { status: 400 });
    }

    if (!config.enabled) {
      return NextResponse.json({
        mode: 'commercial' as const,
        reply: "L'Assistant IA est actuellement désactivé. Veuillez réessayer plus tard ou nous contacter via le formulaire de contact.",
        refused: false,
        requestId: randomBytes(8).toString('hex'),
      } satisfies ChatResponse);
    }

    // [4] Résolution sécurisée du mode (jamais trust ChatRequest.mode du client)
    const resolvedMode = resolveMode(
      userAuth !== null,
      userAuth?.role as 'user' | 'admin' | null,
      config
    );

    const modeEnabled =
      (resolvedMode === 'commercial' && config.commercialEnabled) ||
      (resolvedMode === 'user' && config.userEnabled) ||
      (resolvedMode === 'admin' && config.adminEnabled);

    if (!modeEnabled) {
      return NextResponse.json({
        mode: resolvedMode,
        reply: "Ce mode de l'Assistant IA est actuellement désactivé.",
        refused: false,
        requestId: randomBytes(8).toString('hex'),
      } satisfies ChatResponse);
    }

    // [5] Contexte utilisateur autorisé (READ-ONLY)
    const userContext = await getAuthorizedContext(userAuth);
    const serializedContext = serializeContextForPrompt(userContext);

    // [6] Instructions (générales + mode + limits)
    const generalInstruction = await getInstruction('general');
    const modeInstructionContent = await getInstructionContentForMode(resolvedMode);
    const limitsInstruction = await getInstruction('limits');

    // [7] Personnalité
    const behavior = await getBehavior();

    // [9] Mémoire conversationnelle (10 derniers messages) — loaded BEFORE sources
    // pour permettre la résolution de références conversationnelles
    const conversationId = await getOrCreateConversation(
      userAuth?.id ?? null,
      resolvedMode,
      body.conversationId
    );
    const history = await getRecentMessages(conversationId, 10);

    // [8] Sources de connaissance (lecture DB publique)
    // Enrichir la query avec les 3 derniers messages utilisateur pour résoudre
    // les références conversationnelles ("et pour le master ?" → "master" + contexte précédent)
    const recentUserMessages = history
      .filter(m => m.role === 'user')
      .slice(-3)
      .map(m => m.content)
      .join(' ');
    const enrichedQuery = recentUserMessages ? `${recentUserMessages} ${message}` : message;
    const sources = await getRelevantSources(enrichedQuery);
    const serializedSources = serializeSourcesForPrompt(sources);

    // [10] Assemblage du prompt système (hiérarchie immuable)
    // SYSTEM SAFETY → GENERAL → MODE → LIMITS → BEHAVIOR → KNOWLEDGE → CONTEXT
    const systemPrompt = buildSystemPrompt({
      mode: resolvedMode,
      generalInstructions: generalInstruction.content,
      modeInstructions: modeInstructionContent,
      limitsInstructions: limitsInstruction.content,
      behavior,
      userContext: serializedContext,
      knowledgeSources: serializedSources || undefined,
      responseConfig: {
        mode: config.responseMode,
        maxWords: config.responseMode === 'simple' ? config.simpleMaxWords
          : config.responseMode === 'detailed' ? config.detailedMaxWords
          : config.normalMaxWords,
      },
    });

    // [11] READ-ONLY enforcement
    if (canActOn('call_write_api')) {
      console.warn('[assistant] WRITE action detected — should never happen');
    }

    // [12] Construction des messages pour le LLM
    const llmMessages: LLMMessage[] = [
      // Historique de conversation (mémoire)
      ...history.map(m => ({
        role: m.role === 'system' ? 'assistant' as const : m.role as 'user' | 'assistant',
        content: m.content,
      })),
      // Message utilisateur courant
      { role: 'user' as const, content: message },
    ];

    // [13] Si prompt injection détectée → refus sans appeler le LLM
    if (injectionCheck.suspicious) {
      const refusalReply = "Je ne peux pas traiter cette demande. Je suis l'Assistant IA de HSE Academy, en mode lecture seule, et je ne peux pas modifier ou contourner les règles de sécurité qui me sont imposées.";
      await appendMessage(conversationId, { role: 'user', content: message, mode: resolvedMode });
      await appendMessage(conversationId, { role: 'assistant', content: refusalReply, mode: resolvedMode });
      return NextResponse.json({
        mode: resolvedMode,
        reply: refusalReply,
        refused: true,
        refusalReason: injectionCheck.reason,
        conversationId: conversationId ?? undefined,
        requestId: randomBytes(8).toString('hex'),
      } satisfies ChatResponse);
    }

    // [14] Appel au LLM (z-ai-web-dev-sdk)
    // [14] Appel au LLM — maxTokens calculé depuis responseMode configurable
    const maxWords = config.responseMode === 'simple' ? config.simpleMaxWords
      : config.responseMode === 'detailed' ? config.detailedMaxWords
      : config.normalMaxWords;
    // Approximation: 1 mot ≈ 1.3 tokens + marge 30% pour éviter phrase cassée
    const maxTokens = Math.ceil(maxWords * 1.3 * 1.3);
    const llmReply = await callLLM(systemPrompt, llmMessages, maxTokens);

    // [15] Persister les messages (mémoire) + increment quota
    await appendMessage(conversationId, { role: 'user', content: message, mode: resolvedMode });
    // Increment visitor/user quota (admin = no increment, handled in incrementQuota)
    await incrementQuota(config, userAuthForQuota, visitorId).catch(() => {});

    if (llmReply) {
      // [15.5] PROSPECT TRANSMISSION — détecter et traiter le marqueur [PROSPECT_TRANSMIT]
      // Le LLM peut inclure un bloc structuré pour demander la création d'un ContactMessage.
      // Le serveur valide strictement, crée le ContactMessage si tout est valide,
      // puis supprime le marqueur de la réponse avant de la retourner à l'utilisateur.
      const prospectResult = await processProspectTransmit(llmReply, [
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ]);
      const finalReply = prospectResult.cleanedReply;

      // Persister la réponse NETTOYÉE (sans marqueur interne) dans la mémoire
      await appendMessage(conversationId, { role: 'assistant', content: finalReply, mode: resolvedMode });
      return NextResponse.json({
        mode: resolvedMode,
        reply: finalReply,
        refused: false,
        conversationId: conversationId ?? undefined,
        requestId: randomBytes(8).toString('hex'),
      } satisfies ChatResponse);
    } else {
      // LLM indisponible — graceful degradation
      await appendMessage(conversationId, { role: 'assistant', content: LLM_FALLBACK_REPLY, mode: resolvedMode });
      return NextResponse.json({
        mode: resolvedMode,
        reply: LLM_FALLBACK_REPLY,
        refused: false,
        conversationId: conversationId ?? undefined,
        requestId: randomBytes(8).toString('hex'),
      } satisfies ChatResponse);
    }
  } catch (error) {
    console.error('POST /api/assistant/chat error:', error);
    // Jamais exposer l'erreur interne au client
    return NextResponse.json({
      mode: 'commercial' as const,
      reply: "L'Assistant IA est momentanément indisponible. Veuillez réessayer dans quelques instants.",
      refused: false,
      requestId: randomBytes(8).toString('hex'),
    } satisfies ChatResponse);
  }
}
