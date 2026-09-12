import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');

    const where: Record<string, unknown> = { published: true };
    if (level && level !== 'all') {
      where.level = level;
    }

    const courses = await db.onlineCourse.findMany({
      where,
      include: {
        chapters: {
          select: { id: true, title: true, order: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
            attestations: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    // IDOR FIX (Phase 3) : utiliser auth.id au lieu de searchParams.userId
    let userId: string | null = null;
    try {
      const auth = await requireUser();
      if (!(auth instanceof NextResponse)) {
        userId = auth.id;
      }
    } catch {
      // Non authentifié — pas d'enrollment
    }

    let enriched = courses;
    if (userId) {
      enriched = await Promise.all(
        courses.map(async (course) => {
          const enrollment = await db.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId: course.id } },
          });
          return {
            ...course,
            enrollment: enrollment
              ? {
                  id: enrollment.id,
                  status: enrollment.status,
                  currentChapter: enrollment.currentChapter,
                  completedChapters: JSON.parse(enrollment.completedChapters),
                  overallScore: enrollment.overallScore,
                  courseOrderIndex: enrollment.courseOrderIndex,
                  paymentStatus: enrollment.paymentStatus,
                }
              : null,
          };
        })
      );
    }

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('GET /api/courses error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
