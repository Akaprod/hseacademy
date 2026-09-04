import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { generateUniqueSerialNumber, computeAttestationSignature } from '@/lib/attestation';

export async function GET(req: NextRequest) {
  // H1 : Authentification obligatoire. Le userId de la query string est
  // ignoré — l'utilisateur ne peut consulter QUE ses propres attestations.
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    // searchParams.userId est volontairement ignoré : source de vérité = auth.id
    const attestations = await db.courseAttestation.findMany({
      where: { userId: auth.id },
      include: {
        course: {
          select: { title: true, slug: true, level: true, totalHours: true },
        },
      },
      orderBy: { issuedDate: 'desc' },
    });

    return NextResponse.json(attestations);
  } catch (error) {
    console.error('GET /api/courses/attestations error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // ========================================================================
  // C5 : Authentification — l'utilisateur doit être connecté.
  // L'identité vient UNIQUEMENT de la session serveur (cookie signé).
  // Aucune confiance accordée à body.userId.
  // ========================================================================
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    // Le client peut fournir courseId (et enrollmentId pour rétro-compat),
    // mais ces valeurs ne sont JAMAIS trustées aveuglément : elles sont
    // re-vérifiées en DB contre l'utilisateur authentifié.
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const courseId = typeof body.courseId === 'string' ? body.courseId : null;

    if (!courseId) {
      return NextResponse.json({ error: 'courseId requis' }, { status: 400 });
    }

    // ========================================================================
    // Vérification de l'enrollment — il DOIT appartenir à auth.id.
    // Utilise la contrainte @@unique([userId, courseId]) du schéma Prisma.
    // ========================================================================
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: auth.id, courseId } },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Aucune inscription trouvée pour ce cours' },
        { status: 404 }
      );
    }

    // ========================================================================
    // Vérification de l'éligibilité — basée sur les données réelles en DB.
    // Règle métier existante (route exam, ligne 76) :
    //   status === 'completed'
    // Le status 'completed' est positionné par la route exam quand :
    //   completedChapters.length === courseChapters.length
    //   && tous les chapterScores passent (score >= 60).
    // On ne trust JAMAIS body.overallScore ou body.completedChapters.
    // ========================================================================
    if (enrollment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Cours non terminé — attestation non disponible' },
        { status: 403 }
      );
    }

    // ========================================================================
    // Anti-duplication — conserve la logique existante (par enrollmentId).
    // ========================================================================
    const existing = await db.courseAttestation.findFirst({
      where: { enrollmentId: enrollment.id },
    });
    if (existing) {
      return NextResponse.json(existing);
    }

    // ========================================================================
    // Données de l'attestation — toutes récupérées côté serveur.
    // Le client ne peut PAS choisir :
    //   - le nom (UserProfile.fullName ou User.name depuis la DB)
    //   - le score (enrollment.overallScore depuis la DB)
    //   - le nom du cours (course.title depuis la DB)
    //   - le propriétaire (auth.id)
    // ========================================================================
    const course = await db.onlineCourse.findUnique({
      where: { id: courseId },
      select: { title: true },
    });
    if (!course) {
      return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });
    }

    // ========================================================================
    // IDENTITÉ — déterminer le nom à utiliser pour l'attestation.
    // Priorité : UserProfile.fullName si présent et non vide, sinon User.name.
    // NE JAMAIS accepter fullName depuis le body client.
    // ========================================================================
    let existingProfile = await db.userProfile.findUnique({
      where: { userId: auth.id },
    });

    // Déterminer le nom officiel à utiliser
    const attestationFullName =
      (existingProfile?.fullName && existingProfile.fullName.trim() !== '')
        ? existingProfile.fullName.trim()
        : auth.name;

    // ========================================================================
    // VERROUILLAGE D'IDENTITÉ — se produit ICI, à la première attestation.
    // Si fullNameValidated === false, on verrouille avec le nom utilisé.
    // Si fullNameValidated === true, on NE TOUCHE PAS à fullNameOriginal.
    // ========================================================================
    if (!existingProfile || !existingProfile.fullNameValidated) {
      existingProfile = await db.userProfile.upsert({
        where: { userId: auth.id },
        create: {
          userId: auth.id,
          fullName: attestationFullName,
          fullNameValidated: true,
          fullNameOriginal: attestationFullName,
        },
        update: {
          fullName: attestationFullName,
          fullNameValidated: true,
          // NE PAS écraser fullNameOriginal s'il existe déjà
          ...(existingProfile?.fullNameOriginal ? {} : { fullNameOriginal: attestationFullName }),
        },
      });
    }

    const year = new Date().getFullYear();
    const count = await db.courseAttestation.count({
      where: { issuedDate: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
    });
    const attestationNo = `ATT-${year}-${String(count + 1).padStart(5, '0')}`;

    // ========================================================================
    // AT-P5 : génération du numéro de série public non prédictible + signature
    // Le client ne peut pas fournir serialNumber ou signatureHash — ces valeurs
    // sont générées EXCLUSIVEMENT côté serveur.
    // ========================================================================
    const serialNumber = await generateUniqueSerialNumber();

    // issuedDate figée au moment de la création (utilise default(now()) du schéma)
    const issuedDate = new Date();

    const signatureHash = computeAttestationSignature({
      serialNumber,
      userId: auth.id,
      courseId,
      enrollmentId: enrollment.id,
      overallScore: enrollment.overallScore,
      issuedDate,
    });

    const attestation = await db.courseAttestation.create({
      data: {
        attestationNo,
        serialNumber,            // généré côté serveur
        signatureHash,           // calculé côté serveur via AUTH_SECRET
        userId: auth.id,             // depuis la session, pas depuis le body
        courseId,
        enrollmentId: enrollment.id,  // depuis la DB, vérifié contre auth.id
        fullName: attestationFullName,   // snapshot figé — vient de UserProfile.fullName ou User.name (DB)
        courseName: course.title,     // depuis la DB
        overallScore: enrollment.overallScore,  // depuis la DB, pas depuis le body
        issuedDate,
      },
    });

    return NextResponse.json(attestation);
  } catch (error) {
    console.error('POST /api/courses/attestations error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
