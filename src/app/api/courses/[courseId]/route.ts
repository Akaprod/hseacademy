import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const userId = new URL(req.url).searchParams.get('userId');

    // Try by ID first, then by slug
    let course = await db.onlineCourse.findUnique({ where: { id: courseId } });
    if (!course) {
      course = await db.onlineCourse.findUnique({ where: { slug: courseId } });
    }

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    let enrollment = null;
    if (userId) {
      enrollment = await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
      });
      if (enrollment) {
        enrollment = {
          ...enrollment,
          completedChapters: JSON.parse(enrollment.completedChapters),
          chapterScores: JSON.parse(enrollment.chapterScores),
        };
      }
    }

    return NextResponse.json({ ...course, enrollment });
  } catch (error) {
    console.error('GET /api/courses/[courseId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
