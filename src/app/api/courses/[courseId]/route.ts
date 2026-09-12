import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    let course = await db.onlineCourse.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          select: { id: true, title: true, order: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!course) {
      course = await db.onlineCourse.findUnique({
        where: { slug: courseId },
        include: {
          chapters: {
            select: { id: true, title: true, order: true },
            orderBy: { order: 'asc' },
          },
        },
      });
    }

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    // IDOR FIX : utiliser auth.id au lieu de searchParams.userId
    let enrollment: {
      id: string;
      status: string;
      currentChapter: number;
      courseOrderIndex: number;
      paymentStatus: string;
      completedChapters: unknown;
      chapterScores: unknown;
      overallScore: number;
      startedAt: Date;
      completedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      courseId: string;
    } | null = null;

    try {
      const auth = await requireUser();
      if (!(auth instanceof NextResponse)) {
        const rawEnrollment = await db.enrollment.findUnique({
          where: { userId_courseId: { userId: auth.id, courseId: course.id } },
        });
        if (rawEnrollment) {
          enrollment = {
            ...rawEnrollment,
            completedChapters: JSON.parse(rawEnrollment.completedChapters),
            chapterScores: JSON.parse(rawEnrollment.chapterScores),
          };
        }
      }
    } catch {
      // Non authentifié — pas d'enrollment
    }

    return NextResponse.json({ ...course, enrollment });
  } catch (error) {
    console.error('GET /api/courses/[courseId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
