import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { courseId, chapterId } = await params;
    const userId = new URL(req.url).searchParams.get('userId');

    const chapter = await db.chapter.findFirst({
      where: { id: chapterId, courseId },
      include: {
        questions: { orderBy: { order: 'asc' } },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapitre non trouvé' }, { status: 404 });
    }

    let isCompleted = false;
    let chapterScore = null;
    if (userId) {
      const enrollment = await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });
      if (enrollment) {
        const completed: string[] = JSON.parse(enrollment.completedChapters);
        isCompleted = completed.includes(chapterId);
        const scores: Record<string, { score: number; total: number; passed: boolean }> =
          JSON.parse(enrollment.chapterScores);
        chapterScore = scores[chapterId] || null;
      }
    }

    return NextResponse.json({ ...chapter, isCompleted, chapterScore });
  } catch (error) {
    console.error('GET /api/courses/[courseId]/chapters/[chapterId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
