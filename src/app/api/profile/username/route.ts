import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { validateUsername } from '@/lib/reserved-usernames';

// ============================================================================
// POST /api/profile/username — Définir ou modifier son username
// PATCH /api/profile/username — Toggle profilePublic + modifier champs CV
// ============================================================================
//
// RÈGLES :
//   1. Format : 5 à 12 caractères, lettres/chiffres/underscore
//   2. Unicité : aucun autre utilisateur ne doit avoir le même username
//   3. Liste des réservés : certaines valeurs (directeur, iso9001, admin, etc.)
//      sont interdites — voir src/lib/reserved-usernames.ts
//   4. ADMINS : peuvent bypasser la liste des réservés (mais pas l'unicité)
//   5. RÉTRO-COMPATIBILITÉ : les usernames déjà pris AVANT cette liste ne sont
//      PAS invalidés. La validation s'applique uniquement sur les nouveaux
//      changements.
// ============================================================================

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { username } = body;

    // Vérifier si l'utilisateur est admin (bypass de la liste des réservés)
    const isAdmin = (auth as any)?.role === 'admin';

    // Validation (format + liste des réservés, sauf pour admin)
    const validation = validateUsername(username, isAdmin);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Vérifier l'unicité (peu importe le rôle)
    const existing = await db.userProfile.findFirst({
      where: { username, NOT: { userId: auth.id } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Ce nom d\'utilisateur est déjà utilisé' }, { status: 409 });
    }

    // Mettre à jour le profil
    let profile = await db.userProfile.findUnique({ where: { userId: auth.id } });
    if (!profile) {
      profile = await db.userProfile.create({ data: { userId: auth.id, username } });
    } else {
      await db.userProfile.update({
        where: { userId: auth.id },
        data: { username },
      });
    }

    return NextResponse.json({ username, publicUrl: `/@${username}` });
  } catch (error) {
    console.error('POST /api/profile/username error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.profilePublic !== undefined) data.profilePublic = body.profilePublic;
    if (body.cvTemplate !== undefined) {
      if (!['emerald', 'ocean', 'sunset', 'royal', 'mono'].includes(body.cvTemplate)) {
        return NextResponse.json({ error: 'Palette invalide' }, { status: 400 });
      }
      data.cvTemplate = body.cvTemplate;
    }
    if (body.cvColorPrimary !== undefined) data.cvColorPrimary = body.cvColorPrimary;
    if (body.cvColorAccent !== undefined) data.cvColorAccent = body.cvColorAccent;
    if (body.cvLayout !== undefined) {
      if (!['sidebar', 'centered', 'split'].includes(body.cvLayout)) {
        return NextResponse.json({ error: 'Layout invalide' }, { status: 400 });
      }
      data.cvLayout = body.cvLayout;
    }
    if (body.cvTitle !== undefined) data.cvTitle = body.cvTitle?.trim() || null;
    if (body.cvBio !== undefined) data.cvBio = body.cvBio?.trim() || null;
    if (body.cvSkills !== undefined) data.cvSkills = JSON.stringify(body.cvSkills || []);
    if (body.cvExperience !== undefined) data.cvExperience = JSON.stringify(body.cvExperience || []);

    // ===== 7 RUBRIQUES CV PROFESSIONNEL (Sept 2026) =====
    // 1. Profil professionnel (présentation détaillée — textarea)
    if (body.cvProfessionalProfile !== undefined) {
      data.cvProfessionalProfile = (body.cvProfessionalProfile || '').toString().trim() || null;
    }
    // 2. Expériences professionnelles (array JSON)
    if (body.cvExperiences !== undefined) {
      data.cvExperiences = JSON.stringify(body.cvExperiences || []);
    }
    // 3. Formation & Diplômes (array JSON)
    if (body.cvEducation !== undefined) {
      data.cvEducation = JSON.stringify(body.cvEducation || []);
    }
    // 4. Compétences structurées (array JSON — chaque item : {name, level, category})
    if (body.cvSkillsStructured !== undefined) {
      data.cvSkillsStructured = JSON.stringify(body.cvSkillsStructured || []);
    }
    // 5. Certifications & Attestations (array JSON)
    if (body.cvCertifications !== undefined) {
      data.cvCertifications = JSON.stringify(body.cvCertifications || []);
    }
    // 6. Langues (array JSON)
    if (body.cvLanguages !== undefined) {
      data.cvLanguages = JSON.stringify(body.cvLanguages || []);
    }
    // 7. Informations complémentaires (object JSON — permis, mobilité, etc.)
    if (body.cvAdditionalInfo !== undefined) {
      data.cvAdditionalInfo = JSON.stringify(body.cvAdditionalInfo || {});
    }
    // 7b. Bénévolat (array JSON)
    if (body.cvVolunteer !== undefined) {
      data.cvVolunteer = JSON.stringify(body.cvVolunteer || []);
    }

    await db.userProfile.update({
      where: { userId: auth.id },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/profile/username error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
