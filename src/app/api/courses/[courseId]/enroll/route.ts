import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const course = await db.onlineCourse.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

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

    const enrollment = await db.enrollment.create({
      data: { userId, courseId },
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
