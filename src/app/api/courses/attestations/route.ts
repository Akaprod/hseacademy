import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = new URL(req.url).searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const attestations = await db.courseAttestation.findMany({
      where: { userId },
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
  try {
    const { userId, courseId, enrollmentId, fullName, courseName, overallScore } = await req.json();

    if (!userId || !courseId || !enrollmentId) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const existing = await db.courseAttestation.findFirst({
      where: { enrollmentId },
    });
    if (existing) {
      return NextResponse.json(existing);
    }

    const year = new Date().getFullYear();
    const count = await db.courseAttestation.count({
      where: { issuedDate: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
    });
    const attestationNo = `ATT-${year}-${String(count + 1).padStart(5, '0')}`;

    const attestation = await db.courseAttestation.create({
      data: { attestationNo, userId, courseId, enrollmentId, fullName, courseName, overallScore },
    });

    return NextResponse.json(attestation);
  } catch (error) {
    console.error('POST /api/courses/attestations error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
