// ============================================================================
// POST /api/assistant/sources/sync — Force la mise à jour des sources
// ============================================================================
// Admin only. Force le re-comptage des documents par catégorie et met à jour
// lastSyncAt. getRelevantSources() lit déjà la DB en temps réel, donc cette
// route sert principalement à :
//   1. Rafraîchir documentCount + lastSyncAt affichés dans le dashboard
//   2. Invalider d'éventuels caches (si ajoutés à l'avenir)
//   3. Donner un feedback visuel à l'admin que les sources sont à jour
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAllSources } from '@/assistant/services/sources';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    // getAllSources() fait déjà le re-comptage + update documentCount + lastSyncAt
    const sources = await getAllSources();

    return NextResponse.json({
      success: true,
      message: 'Sources mises à jour',
      sources,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('POST /api/assistant/sources/sync error:', error);
    return NextResponse.json({ error: 'Erreur lors de la synchronisation' }, { status: 500 });
  }
}

// ============================================================================
// GET /api/assistant/sources/sync — Auto-sync (pour cron externe)
// ============================================================================
// Pas d'auth requise (le re-comptage est une opération read-only sur DB publique).
// Peut être appelé par un cron Hostinger toutes les heures.
// ============================================================================
export async function GET() {
  try {
    const sources = await getAllSources();
    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      count: sources.length,
    });
  } catch (error) {
    console.error('GET /api/assistant/sources/sync error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
