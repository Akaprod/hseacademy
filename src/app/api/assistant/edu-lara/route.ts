// ============================================================================
// GET /api/assistant/edu-lara — Admin only
// ============================================================================
// Retourne le contenu des 5 fichiers EDU LARA (01..05) en lecture seule.
// Ces fichiers sont codés en dur dans le source (non éditables via dashboard)
// car ils contiennent le comportement conversationnel fondamental de Lara.
//
// L'admin peut les LIRE pour vérifier ce que Lara sait, mais ne peut pas les
// MODIFIER depuis le dashboard (modification = code change + redeploy).
// ============================================================================

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { EDU_LARA_01 } from '@/assistant/instructions/edu-lara-01';
import { EDU_LARA_02 } from '@/assistant/instructions/edu-lara-02';
import { EDU_LARA_03 } from '@/assistant/instructions/edu-lara-03';
import { EDU_LARA_04 } from '@/assistant/instructions/edu-lara-04';
import { EDU_LARA_05 } from '@/assistant/instructions/edu-lara-05';
import { SYSTEM_SAFETY_RULES } from '@/assistant/instructions/system-safety';
import { INSTITUTIONAL_CONTEXT } from '@/assistant/instructions/institutional-context';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    return NextResponse.json({
      eduLaraLayers: [
        {
          id: 'edu-lara-01',
          title: 'EDU LARA N°01 — Comportement conversationnel',
          description: "Couche additive définissant le comportement conversationnel fondamental de Lara (salutation, écoute, qualification).",
          content: EDU_LARA_01,
          editable: false,
          sourceFile: 'src/assistant/instructions/edu-lara-01.ts',
        },
        {
          id: 'edu-lara-02',
          title: 'EDU LARA N°02 — Qualification + orientation commerciale',
          description: "Couche additive pour qualifier le prospect et orienter vers les formations pertinentes.",
          content: EDU_LARA_02,
          editable: false,
          sourceFile: 'src/assistant/instructions/edu-lara-02.ts',
        },
        {
          id: 'edu-lara-03',
          title: 'EDU LARA N°03 — Inscription et accompagnement prospect',
          description: "Couche additive pour guider le prospect vers l'inscription et l'accompagnement humain.",
          content: EDU_LARA_03,
          editable: false,
          sourceFile: 'src/assistant/instructions/edu-lara-03.ts',
        },
        {
          id: 'edu-lara-04',
          title: 'EDU LARA N°04 — Mémoire prospect + collecte + transmission',
          description: "Couche additive pour mémoriser les informations prospect et préparer la transmission.",
          content: EDU_LARA_04,
          editable: false,
          sourceFile: 'src/assistant/instructions/edu-lara-04.ts',
        },
        {
          id: 'edu-lara-05',
          title: 'EDU LARA N°05 — Transmission réelle des prospects',
          description: "Couche additive pour la transmission effective des prospects au système (marqueur PROSPECT_TRANSMIT).",
          content: EDU_LARA_05,
          editable: false,
          sourceFile: 'src/assistant/instructions/edu-lara-05.ts',
        },
      ],
      systemLayers: [
        {
          id: 'system-safety',
          title: 'SYSTEM SAFETY RULES (immuables)',
          description: "Règles de sécurité fondamentales — JAMAIS éditables, JAMAIS contournables.",
          content: SYSTEM_SAFETY_RULES,
          editable: false,
          sourceFile: 'src/assistant/instructions/system-safety.ts',
        },
        {
          id: 'institutional-context',
          title: 'Contexte institutionnel IICP / HSE Academy',
          description: "Contexte officiel de l'établissement — primauté sur les connaissances générales du modèle.",
          content: INSTITUTIONAL_CONTEXT,
          editable: false,
          sourceFile: 'src/assistant/instructions/institutional-context.ts',
        },
      ],
    });
  } catch (error) {
    console.error('GET /api/assistant/edu-lara error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
