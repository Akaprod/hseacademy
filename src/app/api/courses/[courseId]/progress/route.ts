import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const userId = new URL(req.url).searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 });
    }

    const course = await db.onlineCourse.findUnique({
      where: { id: courseId },
      include: {
        chapters: { select: { id: true, title: true, order: true }, orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json({
      ...enrollment,
      completedChapters: JSON.parse(enrollment.completedChapters),
      chapterScores: JSON.parse(enrollment.chapterScores),
      course,
    });
  } catch (error) {
    console.error('GET /api/courses/[courseId]/progress error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
