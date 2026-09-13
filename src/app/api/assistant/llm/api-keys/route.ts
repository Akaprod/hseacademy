// ============================================================================
// GET  /api/assistant/llm/api-keys   — list all API keys (admin only, MASKED)
// POST /api/assistant/llm/api-keys   — create a new API key
// ============================================================================
// SÉCURITÉ CRITIQUE :
//   - Le champ `apiKey` n'est JAMAIS retourné par GET
//   - Seul `keyHint` (4 derniers caractères) est exposé pour affichage
//   - POST accepte le champ `apiKey` en clair (HTTPS le protège en transit)
//     et le stocke en DB. Il n'est plus jamais exposé ensuite.
//   - requireAdmin() sur les 2 méthodes
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const keys = await db.assistantLlmApiKey.findMany({
      orderBy: [{ providerId: 'asc' }, { priority: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        providerId: true,
        label: true,
        // apiKey is NEVER selected here
        keyHint: true,
        enabled: true,
        priority: true,
        status: true,
        lastUsedAt: true,
        lastSuccessAt: true,
        lastErrorAt: true,
        lastErrorCode: true,
        failureCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ apiKeys: keys });
  } catch (error: any) {
    console.error('GET /api/assistant/llm/api-keys error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const { providerId, label, apiKey, priority, enabled } = body;

    // Validation
    if (!providerId || typeof providerId !== 'string') {
      return NextResponse.json({ error: 'providerId requis' }, { status: 400 });
    }
    if (!label || typeof label !== 'string' || label.length < 1 || label.length > 80) {
      return NextResponse.json({ error: 'label requis (1-80 chars)' }, { status: 400 });
    }
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10 || apiKey.length > 500) {
      return NextResponse.json({ error: 'apiKey invalide (10-500 chars)' }, { status: 400 });
    }

    // Verify provider exists
    const provider = await db.assistantLlmProvider.findUnique({ where: { id: providerId } });
    if (!provider) {
      return NextResponse.json({ error: 'Provider introuvable' }, { status: 404 });
    }

    // Compute keyHint (last 4 chars) — display purposes only
    const keyHint = apiKey.length > 4 ? apiKey.slice(-4) : '****';

    const key = await db.assistantLlmApiKey.create({
      data: {
        providerId,
        label,
        apiKey,
        keyHint,
        enabled: typeof enabled === 'boolean' ? enabled : true,
        priority: typeof priority === 'number' && priority > 0 ? priority : 10,
        status: 'never_used',
      },
      select: {
        id: true,
        providerId: true,
        label: true,
        keyHint: true,
        enabled: true,
        priority: true,
        status: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ apiKey: key });
  } catch (error: any) {
    console.error('POST /api/assistant/llm/api-keys error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
