import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { generateUniqueSerialNumber, computeAttestationSignature } from '@/lib/attestation';
import { canIssueAttestation } from '@/lib/payment';

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
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
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const courseId = typeof body.courseId === 'string' ? body.courseId : null;

    if (!courseId) {
      return NextResponse.json({ error: 'courseId requis' }, { status: 400 });
    }

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
    // Phase 3 — PAYMENT GATE
    // Vérifier que le paiement est validé (ou non requis pour le 1er cours)
    // ========================================================================
    if (!canIssueAttestation(enrollment.status, enrollment.paymentStatus)) {
      if (enrollment.status !== 'completed') {
        return NextResponse.json(
          { error: 'Cours non terminé — attestation non disponible', code: 'COURSE_NOT_COMPLETED' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: 'Paiement requis pour délivrer l\'attestation', code: 'PAYMENT_REQUIRED' },
        { status: 403 }
      );
    }

    // Anti-duplication
    const existing = await db.courseAttestation.findFirst({
      where: { enrollmentId: enrollment.id },
    });
    if (existing) {
      return NextResponse.json(existing);
    }

    const course = await db.onlineCourse.findUnique({
      where: { id: courseId },
      select: { title: true },
    });
    if (!course) {
      return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });
    }

    let existingProfile = await db.userProfile.findUnique({
      where: { userId: auth.id },
    });

    const attestationFullName =
      (existingProfile?.fullName && existingProfile.fullName.trim() !== '')
        ? existingProfile.fullName.trim()
        : auth.name;

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
          ...(existingProfile?.fullNameOriginal ? {} : { fullNameOriginal: attestationFullName }),
        },
      });
    }

    const year = new Date().getFullYear();
    const count = await db.courseAttestation.count({
      where: { issuedDate: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
    });
    const attestationNo = `ATT-${year}-${String(count + 1).padStart(5, '0')}`;

    const serialNumber = await generateUniqueSerialNumber();
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
        serialNumber,
        signatureHash,
        userId: auth.id,
        courseId,
        enrollmentId: enrollment.id,
        fullName: attestationFullName,
        courseName: course.title,
        overallScore: enrollment.overallScore,
        issuedDate,
      },
    });

    return NextResponse.json(attestation);
  } catch (error) {
    console.error('POST /api/courses/attestations error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
