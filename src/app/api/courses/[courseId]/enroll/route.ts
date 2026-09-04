import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  // H3 : Authentification obligatoire. body.userId est ignoré —
  // l'inscription est toujours créée pour l'utilisateur connecté.
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { courseId } = await params;

    const course = await db.onlineCourse.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    // userId vient de la session serveur, jamais du body
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
