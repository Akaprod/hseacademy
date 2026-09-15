import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { fullNameSchema, compareNames } from '@/lib/validation';

// ============================================================================
// POST /api/profile/identity — mettre à jour son nom (SANS verrouiller)
// ============================================================================
// Le verrouillage de l'identité ne se produit PLUS ici.
// Il se produit UNIQUEMENT lors de la première émission d'attestation
// (POST /api/courses/attestations).
//
// Cette route permet uniquement de mettre à jour fullName tant que
// fullNameValidated === false. Une fois verrouillé, toute modification
// doit passer par la logique de correction (PUT ci-dessous).
// ============================================================================

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { fullName } = body;

    const nameCheck = fullNameSchema.safeParse(fullName);
    if (!nameCheck.success) {
      return NextResponse.json({ error: nameCheck.error.issues[0].message }, { status: 400 });
    }

    const existing = await db.userProfile.findUnique({ where: { userId: auth.id } });
    if (existing?.fullNameValidated) {
      return NextResponse.json(
        { error: 'Votre identité est verrouillée suite à l\'émission d\'une attestation. Contactez l\'administration pour toute correction.' },
        { status: 403 }
      );
    }

    // Mettre à jour le nom SANS verrouiller
    await db.userProfile.upsert({
      where: { userId: auth.id },
      create: {
        userId: auth.id,
        fullName: fullName.trim(),
        fullNameValidated: false, // reste false — le verrouillage se fait à la première attestation
      },
      update: {
        fullName: fullName.trim(),
        // fullNameValidated reste false
      },
    });

    return NextResponse.json({ success: true, fullName: fullName.trim(), validated: false });
  } catch (error) {
    console.error('POST /api/profile/identity error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ============================================================================
// PUT /api/profile/identity — demande de correction (si déjà verrouillé)
// ============================================================================
// La comparaison se fait TOUJOURS contre fullNameOriginal (l'identité de
// référence capturée lors de la première attestation), JAMAIS contre la
// valeur courante fullName.
// ============================================================================

export async function PUT(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { newFullName, reason } = body;

    const profile = await db.userProfile.findUnique({ where: { userId: auth.id } });
    if (!profile?.fullNameValidated) {
      return NextResponse.json({ error: 'Identité non verrouillée — utilisez la modification normale' }, { status: 400 });
    }

    const nameCheck = fullNameSchema.safeParse(newFullName);
    if (!nameCheck.success) {
      return NextResponse.json({ error: nameCheck.error.issues[0].message }, { status: 400 });
    }

    // Comparer avec l'ORIGINAL (fullNameOriginal), pas avec fullName courant
    const comparison = compareNames(profile.fullNameOriginal || profile.fullName || '', newFullName.trim());

    if (comparison.similarity === 1.0) {
      return NextResponse.json({ error: 'Aucune modification détectée' }, { status: 400 });
    }

    if (comparison.isMinorCorrection) {
      // Correction légère — auto-approuvée mais journalisée
      const history = JSON.parse(profile.fullNameHistory || '[]');
      history.push({
        old: profile.fullName,
        new: newFullName.trim(),
        date: new Date().toISOString(),
        by: auth.id,
        reason: reason || 'Correction mineure',
        autoApproved: true,
        // NE JAMAIS modifier fullNameOriginal ici
      });
      await db.userProfile.update({
        where: { userId: auth.id },
        data: {
          fullName: newFullName.trim(),
          fullNameHistory: JSON.stringify(history),
          // fullNameOriginal reste STRICTEMENT inchangé
        },
      });
      return NextResponse.json({ success: true, autoApproved: true, fullName: newFullName.trim() });
    }

    // Changement substantiel — doit être validé par admin
    const history = JSON.parse(profile.fullNameHistory || '[]');
    history.push({
      old: profile.fullName,
      new: newFullName.trim(),
      date: new Date().toISOString(),
      by: auth.id,
      reason: reason || 'Demande de changement',
      autoApproved: false,
      status: 'pending',
    });
    await db.userProfile.update({
      where: { userId: auth.id },
      data: { fullNameHistory: JSON.stringify(history) },
    });
    return NextResponse.json({
      success: false,
      error: 'Ce changement nécessite l\'approbation de la Direction. Votre demande a été enregistrée.',
    }, { status: 403 });
  } catch (error) {
    console.error('PUT /api/profile/identity error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
