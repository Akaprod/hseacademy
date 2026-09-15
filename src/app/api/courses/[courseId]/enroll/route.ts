import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { getInitialPaymentStatus } from '@/lib/payment';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { courseId } = await params;

    const course = await db.onlineCourse.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    const userId = auth.id;

    const existing = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) {
      return NextResponse.json({
        ...existing,
        completedChapters: JSON.parse(existing.completedChapters),
        chapterScores: JSON.parse(existing.chapterScores),
      });
    }

    // Phase 3 — Calculer courseOrderIndex côté serveur
    // Compter les enrollments existants pour cet utilisateur
    const existingEnrollmentCount = await db.enrollment.count({
      where: { userId },
    });
    const courseOrderIndex = existingEnrollmentCount + 1;
    const paymentStatus = getInitialPaymentStatus(courseOrderIndex);

    const enrollment = await db.enrollment.create({
      data: {
        userId,
        courseId,
        courseOrderIndex,
        paymentStatus,
      },
    });

    return NextResponse.json({
      ...enrollment,
      completedChapters: [],
      chapterScores: {},
    });
  } catch (error) {
    console.error('POST /api/courses/[courseId]/enroll error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
