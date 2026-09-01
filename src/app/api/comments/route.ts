import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
  try {
    const body = await request.json();
    const { content, articleId, userId } = body;

    if (!content || !articleId || !userId) {
      return NextResponse.json({ error: 'Contenu, articleId et userId requis' }, { status: 400 });
    }

    const comment = await db.comment.create({
      data: { content, articleId, userId, status: 'approved' },
      include: { user: { select: { name: true, avatar: true } } },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}