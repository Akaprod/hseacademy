// ============================================================================
// POST /api/assistant/llm/providers/[id]/test
// ============================================================================
// Teste un provider en effectuant un appel minimal (prompt "Bonjour").
// Utilise la première clé active du provider. Si aucune clé n'est configurée,
// retourne une erreur claire.
//
// Le but est de permettre à l'admin de vérifier qu'un provider fonctionne
// AVANT de l'activer en production.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getProviderAdapter } from '@/assistant/providers/registry';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const provider = await db.assistantLlmProvider.findUnique({ where: { id } });
    if (!provider) {
      return NextResponse.json({ error: 'Provider introuvable' }, { status: 404 });
    }

    // Get first active API key
    const key = await db.assistantLlmApiKey.findFirst({
      where: { providerId: id, enabled: true, status: { not: 'invalid' } },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, apiKey: true, label: true },
    });
    if (!key) {
      return NextResponse.json({
        ok: false,
        status: 'no_key',
        message: 'Aucune clé API active pour ce provider. Ajoutez d\'abord une clé depuis l\'onglet API Keys.',
      });
    }

    const adapter = getProviderAdapter(provider.code);
    if (!adapter) {
      return NextResponse.json({
        ok: false,
        status: 'no_adapter',
        message: `Adapter non enregistré pour le code "${provider.code}". Provider à implémenter dans src/assistant/providers/${provider.code}.ts.`,
      });
    }

    const result = await adapter.call({
      baseUrl: provider.baseUrl,
      apiKey: key.apiKey,
      model: provider.defaultModel,
      messages: [
        { role: 'system', content: 'Tu es Lara, assistante IA de HSE Academy. Réponds en français de façon concise.' },
        { role: 'user', content: 'Bonjour' },
      ],
      maxTokens: 50,
      timeoutMs: provider.code === 'zai' ? 60000 : 20000, // Z.ai free tier needs more time
    });

    // Update key status
    const now = new Date();
    if (result.status === 'success') {
      await db.assistantLlmApiKey.update({
        where: { id: key.id },
        data: {
          lastUsedAt: now,
          lastSuccessAt: now,
          status: 'active',
          lastErrorCode: null,
          failureCount: 0,
        },
      }).catch(() => {});
    } else {
      await db.assistantLlmApiKey.update({
        where: { id: key.id },
        data: {
          lastUsedAt: now,
          lastErrorAt: now,
          lastErrorCode: result.errorCode || null,
          status: mapStatus(result.status),
          failureCount: { increment: 1 },
        },
      }).catch(() => {});
    }

    // Public response — NEVER include the API key
    return NextResponse.json({
      ok: result.status === 'success',
      status: result.status,
      httpStatus: result.httpStatus || null,
      errorCode: result.errorCode || null,
      errorMessage: result.errorMessage || null,
      latencyMs: result.latencyMs,
      contentPreview: result.content ? result.content.slice(0, 150) : null,
      model: provider.defaultModel,
      keyLabel: key.label,
      keyHint: key.apiKey.slice(-4),
    });
  } catch (error: any) {
    console.error('POST /api/assistant/llm/providers/[id]/test error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

function mapStatus(callStatus: string): string {
  switch (callStatus) {
    case 'success': return 'active';
    case 'rate_limited': return 'rate_limited';
    case 'auth_error': return 'auth_error';
    case 'quota_exhausted': return 'quota_exhausted';
    case 'network_error': return 'network_error';
    case 'empty_content': return 'active';
    case 'server_error':
    case 'client_error':
    case 'unknown_error':
    default: return 'active';
  }
}
