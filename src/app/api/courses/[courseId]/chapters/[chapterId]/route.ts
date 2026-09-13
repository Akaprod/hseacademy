import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  // IDOR FIX : authentification obligatoire côté serveur.
  // L'userId ne provient plus de la query string mais de la session HMAC.
  // Contrôle d'accès : un utilisateur ne peut consulter un chapitre que
  // s'il est inscrit au cours correspondant (vérifié en DB via auth.id).
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { courseId, chapterId } = await params;
    const userId = auth.id;

    // Contrôle d'inscription obligatoire — l'utilisateur doit être inscrit
    // au cours pour accéder au contenu du chapitre.
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 });
    }

    // Select Prisma EXPLICITE : on ne retourne JAMAIS `correctIndex` ni
    // `explanation` au client via cette route. Le client reçoit uniquement
    // les champs nécessaires à l'affichage du chapitre et des questions
    // d'examen (la correction se fait côté serveur dans la route /exam).
    const chapter = await db.chapter.findFirst({
      where: { id: chapterId, courseId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            options: true,
            order: true,
            // correctIndex et explanation sont délibérément OMIS ici.
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapitre non trouvé' }, { status: 404 });
    }

    // isCompleted / chapterScore calculés depuis l'enrollment déjà chargé
    // (plus besoin d'une 2e requête — économie DB + cohérence avec auth.id).
    const completed: string[] = JSON.parse(enrollment.completedChapters);
    const isCompleted = completed.includes(chapterId);
    const scores: Record<string, { score: number; total: number; passed: boolean }> =
      JSON.parse(enrollment.chapterScores);
    const chapterScore = scores[chapterId] || null;

    return NextResponse.json({ ...chapter, isCompleted, chapterScore });
  } catch (error) {
    console.error('GET /api/courses/[courseId]/chapters/[chapterId] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
