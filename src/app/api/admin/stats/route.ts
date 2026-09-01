import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [
      totalArticles,
      publishedArticles,
      totalCertifications,
      validCertifications,
      totalFormations,
      totalCategories,
      totalUsers,
      totalNewsletter,
      totalContacts,
      unreadContacts,
      totalComments,
      pendingComments,
      totalTestimonials,
      totalPages,
      totalMenus,
      recentArticles,
      recentContacts,
      topArticles,
    ] = await Promise.all([
      db.article.count(),
      db.article.count({ where: { published: true } }),
      db.certification.count(),
      db.certification.count({ where: { status: 'valid' } }),
      db.formation.count(),
      db.category.count(),
      db.user.count(),
      db.newsletter.count({ where: { active: true } }),
      db.contactMessage.count(),
      db.contactMessage.count({ where: { read: false } }),
      db.comment.count(),
      db.comment.count({ where: { status: 'pending' } }),
      db.testimonial.count(),
      db.page.count(),
      db.menuItem.count({ where: { parentId: null } }),
      db.article.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, viewCount: true, createdAt: true, published: true } }),
      db.contactMessage.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, subject: true, read: true, createdAt: true } }),
      db.article.findMany({ take: 5, orderBy: { viewCount: 'desc' }, select: { id: true, title: true, viewCount: true } }),
    ]);

    const articlesByCategory = await db.category.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: 'asc' },
    });

    const certificationsByStatus = await db.certification.groupBy({
      by: ['status'],
      _count: true,
    });

    const contactsByMonth = await db.$queryRaw<Array<{ month: string; count: number }>>`
      SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count
      FROM ContactMessage
      WHERE createdAt >= datetime('now', '-6 months')
      GROUP BY month
      ORDER BY month
    `;

    const articlesByMonth = await db.$queryRaw<Array<{ month: string; count: number }>>`
      SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count
      FROM Article
      WHERE createdAt >= datetime('now', '-6 months')
      GROUP BY month
      ORDER BY month
    `;

    return NextResponse.json({
      overview: {
        totalArticles,
        publishedArticles,
        draftArticles: totalArticles - publishedArticles,
        totalCertifications,
        validCertifications,
        totalFormations,
        totalCategories,
        totalUsers,
        totalNewsletter,
        totalContacts,
        unreadContacts,
        totalComments,
        pendingComments,
        totalTestimonials,
        totalPages,
        totalMenus,
      },
      recentArticles,
      recentContacts,
      topArticles,
      articlesByCategory,
      certificationsByStatus,
      contactsByMonth,
      articlesByMonth,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}