// ============================================================================
// POST /api/assistant/llm/api-keys/quick-add
// ============================================================================
// SIMPLIFIED UX FLOW for adding an API key:
//   1. Admin selects a preset (Groq, Z.ai, OpenAI, Anthropic, OpenRouter,
//      DeepSeek, Mistral) from a dropdown
//   2. Admin pastes the API key
//   3. Optional: label, priority
//   4. Submit
//
// The server handles:
//   - Find provider by code (create if not exists, using preset's technical
//     details — admin doesn't need to know baseUrl/adapter)
//   - Create the API key under that provider
//   - Return the key info (without apiKey — security)
//
// This route is the ONLY entry point for the simplified "Ajouter une API"
// button in the dashboard. The technical provider creation form is no
// longer exposed to the admin.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { PROVIDER_PRESETS } from '../../providers/route';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const { code, apiKey, label, priority } = body;

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'code requis (choisir un preset)' }, { status: 400 });
    }
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10 || apiKey.length > 500) {
      return NextResponse.json({ error: 'apiKey invalide (10-500 chars)' }, { status: 400 });
    }

    // Look up preset
    const preset = PROVIDER_PRESETS.find(p => p.code === code);
    if (!preset) {
      return NextResponse.json({
        error: `Preset "${code}" inconnu. Presets disponibles : ${PROVIDER_PRESETS.map(p => p.code).join(', ')}`
      }, { status: 400 });
    }

    // Find or create provider
    let provider = await db.assistantLlmProvider.findUnique({ where: { code: preset.code } });
    if (!provider) {
      provider = await db.assistantLlmProvider.create({
        data: {
          code: preset.code,
          displayName: preset.displayName,
          adapter: preset.adapter,
          baseUrl: preset.baseUrl,
          defaultModel: preset.defaultModel,
          availableModels: preset.availableModels,
          enabled: true,
          priority: 10,
        },
      });
    }

    // Compute label (default if not provided)
    const keyLabel = (label && typeof label === 'string' && label.length >= 1 && label.length <= 80)
      ? label
      : `${preset.displayName} ${new Date().toLocaleString('fr-FR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`;

    // Compute priority (default 10)
    const keyPriority = (typeof priority === 'number' && priority > 0 && priority < 1000) ? priority : 10;

    // Compute keyHint (last 4 chars) for display only
    const keyHint = apiKey.length > 4 ? apiKey.slice(-4) : '****';

    // Create the API key
    const newKey = await db.assistantLlmApiKey.create({
      data: {
        providerId: provider.id,
        label: keyLabel,
        apiKey,
        keyHint,
        enabled: true,
        priority: keyPriority,
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

    return NextResponse.json({
      apiKey: newKey,
      provider: {
        id: provider.id,
        code: provider.code,
        displayName: provider.displayName,
        defaultModel: provider.defaultModel,
      },
      // Confirm to admin: technical details were auto-filled from preset
      autoFilled: {
        baseUrl: preset.baseUrl,
        adapter: preset.adapter,
        defaultModel: preset.defaultModel,
        availableModelsCount: JSON.parse(preset.availableModels || '[]').length,
      },
    });
  } catch (error: any) {
    console.error('POST /api/assistant/llm/api-keys/quick-add error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
