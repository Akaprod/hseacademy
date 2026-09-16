import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/stats — statistiques du Tableau de Bord
// Retourne { overview, recentArticles, topArticles, recentContacts,
//            certificationsByStatus, articlesByCategory,
//            contactsByMonth, articlesByMonth }
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
      topArticles,
      recentContacts,
      certificationsByStatus,
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
      db.article.findMany({
        orderBy: { createdAt: 'desc' }, take: 5,
        select: { id: true, title: true, slug: true, published: true, createdAt: true },
      }),
      // Top articles by viewCount
      db.article.findMany({
        orderBy: { viewCount: 'desc' }, take: 5,
        select: { id: true, title: true, viewCount: true },
      }),
      // Recent contacts
      db.contactMessage.findMany({
        orderBy: { createdAt: 'desc' }, take: 5,
        select: { id: true, name: true, subject: true, read: true, createdAt: true },
      }),
      // Certifications by status (groupBy)
      db.certification.groupBy({
        by: ['status'],
        _count: { status: true },
      }).then(groups => groups.map(g => ({ status: g.status, _count: g._count.status }))),
    ]);

    // === Articles par mois (6 derniers mois) ===
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const articlesRaw = await db.article.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });
    const articlesByMonth = aggregateByMonth(articlesRaw.map(a => a.createdAt));

    // === Contacts par mois (6 derniers mois) ===
    const contactsRaw = await db.contactMessage.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });
    const contactsByMonth = aggregateByMonth(contactsRaw.map(c => c.createdAt));

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
      topArticles,
      recentContacts,
      certificationsByStatus,
      articlesByCategory: [], // pas utilisé actuellement dans l'UI
      contactsByMonth,
      articlesByMonth,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ============================================================================
// Helper : regrouper des dates par mois pour les graphiques
// ============================================================================
// Retourne [{ month: "MM/YYYY", count: number }] pour les 6 derniers mois.
// ============================================================================
function aggregateByMonth(dates: Date[]): Array<{ month: string; count: number }> {
  const now = new Date();
  const months: Array<{ month: string; count: number }> = [];

  // Construire les 6 derniers mois (du plus ancien au plus récent)
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    months.push({ month: label, count: 0 });
  }

  // Compter les dates par mois
  for (const date of dates) {
    const d = new Date(date);
    const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const entry = months.find(m => m.month === label);
    if (entry) entry.count++;
  }

  return months;
}
