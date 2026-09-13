import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  // IDOR FIX : l'identité de l'utilisateur provient exclusivement de la session
  // serveur (cookie HMAC signé). Le paramètre `userId` n'est plus lu depuis
  // la query string — un utilisateur ne peut accéder qu'à sa propre progression.
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { courseId } = await params;
    const userId = auth.id;

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
