import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { courseId, chapterId } = await params;
    const { userId, answers } = await req.json(); // answers: { [questionId]: selectedOptionIndex }

    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const chapter = await db.chapter.findFirst({
      where: { id: chapterId, courseId },
      include: { questions: true },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapitre non trouvé' }, { status: 404 });
    }

    const questions = chapter.questions;
    const totalQuestions = questions.length;
    let correctCount = 0;
    const results = questions.map((q) => {
      const userAnswer = answers[q.id] ?? -1;
      const isCorrect = userAnswer === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        userAnswer,
        correctAnswer: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 60;

    // Update enrollment
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (enrollment) {
      const completedChapters: string[] = JSON.parse(enrollment.completedChapters);
      const chapterScores: Record<string, { score: number; total: number; passed: boolean }> =
        JSON.parse(enrollment.chapterScores);

      if (passed && !completedChapters.includes(chapterId)) {
        completedChapters.push(chapterId);
      }
      chapterScores[chapterId] = { score, total: totalQuestions, passed };

      // Calculate new overall score
      const allScores = Object.values(chapterScores);
      const overallScore =
        allScores.length > 0
          ? Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length)
          : 0;

      // Update current chapter
      const courseChapters = await db.chapter.findMany({
        where: { courseId },
        orderBy: { order: 'asc' },
        select: { id: true },
      });
      const chapterIndex = courseChapters.findIndex((c) => c.id === chapterId);
      const nextChapter = chapterIndex < courseChapters.length - 1 ? chapterIndex + 2 : courseChapters.length;

      // Check if course is complete
      const isCourseComplete = completedChapters.length === courseChapters.length && allScores.every((s) => s.passed);

      await db.enrollment.update({
        where: { userId_courseId: { userId, courseId } },
        data: {
          completedChapters: JSON.stringify(completedChapters),
          chapterScores: JSON.stringify(chapterScores),
          overallScore,
          currentChapter: Math.max(enrollment.currentChapter, nextChapter),
          status: isCourseComplete ? 'completed' : 'active',
          completedAt: isCourseComplete ? new Date() : null,
        },
      });
    }

    return NextResponse.json({
      score,
      totalQuestions,
      correctCount,
      passed,
      results,
    });
  } catch (error) {
    console.error('POST /api/courses/[courseId]/chapters/[chapterId]/exam error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
