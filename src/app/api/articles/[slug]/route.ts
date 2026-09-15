import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const article = await db.article.findUnique({
      where: { slug },
      include: {
        category: true,
        comments: {
          where: { status: 'approved' },
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // M-5 (Security Batch 1) — Draft article disclosure.
    // Ne jamais retourner un article dont published === false via la route publique.
    // findUnique garde l'optimisation de l'index unique sur slug, puis on filtre
    // explicitement pour préserver l'include structure (category + comments).
    if (!article || !article.published) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });
    }

    await db.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ article: { ...article, viewCount: article.viewCount + 1 } });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}