import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const articleId = request.nextUrl.searchParams.get('articleId');
    if (!articleId) {
      return NextResponse.json({ error: 'articleId requis' }, { status: 400 });
    }

    const comments = await db.comment.findMany({
      where: { articleId, status: 'approved' },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // H2 : Authentification obligatoire. body.userId est ignoré —
  // le commentaire est toujours créé au nom de l'utilisateur connecté.
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { content, articleId } = body;

    if (!content || !articleId) {
      return NextResponse.json({ error: 'Contenu et articleId requis' }, { status: 400 });
    }

    // userId vient de la session serveur, jamais du body
    const comment = await db.comment.create({
      data: { content, articleId, userId: auth.id, status: 'approved' },
      include: { user: { select: { name: true, avatar: true } } },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}