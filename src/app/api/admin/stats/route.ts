import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/stats — statistiques du Tableau de Bord (overview + recent articles)
// Retourne un objet { overview: OverviewStats, recentArticles: Article[] }
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const [
      totalArticles, publishedArticles, draftArticles,
      totalCertifications, validCertifications,
      totalFormations, totalCategories,
      totalUsers, totalNewsletter,
      totalContacts, unreadContacts,
      totalComments, pendingComments,
      totalTestimonials, totalPages, totalMenus,
      recentArticles,
    ] = await Promise.all([
      db.article.count(),
      db.article.count({ where: { published: true } }),
      db.article.count({ where: { published: false } }),
      db.certification.count(),
      db.certification.count({ where: { status: 'valid' } }),
      db.formation.count({ where: { archived: false } }),
      db.category.count(),
      db.user.count(),
      db.newsletter.count(),
      db.contactMessage.count(),
      db.contactMessage.count({ where: { read: false } }),
      db.comment.count(),
      db.comment.count({ where: { status: 'pending' } }),
      db.testimonial.count(),
      db.page.count(),
      db.menuItem.count(),
      db.article.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, title: true, slug: true, published: true, createdAt: true } }),
    ]);

    return NextResponse.json({
      overview: {
        totalArticles, publishedArticles, draftArticles,
        totalCertifications, validCertifications,
        totalFormations, totalCategories,
        totalUsers, totalNewsletter,
        totalContacts, unreadContacts,
        totalComments, pendingComments,
        totalTestimonials, totalPages, totalMenus,
      },
      recentArticles,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
