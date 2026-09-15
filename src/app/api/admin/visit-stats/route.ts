import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/stats?period=today|7d|30d|90d|year|all
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Compute date range
    const now = new Date();
    let since: Date;
    switch (period) {
      case 'today':
        since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        since = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        since = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        since = new Date(0);
        break;
    }

    // 1) Total visits in period
    const totalVisits = await db.visit.count({
      where: { createdAt: { gte: since } },
    });

    // 2) Daily breakdown (last 30 days) — for the chart
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyRows = await db.visit.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: true,
    });
    // Build a 30-day array (might not have entries for some days)
    const daily: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().slice(0, 10);
      // Count visits for this day
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const count = await db.visit.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      });
      daily.push({ date: dateStr, count });
    }

    // 3) Top 10 pages (in period)
    const topPagesRaw = await db.visit.groupBy({
      by: ['path', 'pageType'],
      where: { createdAt: { gte: since } },
      _count: true,
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    });
    const topPages = topPagesRaw.map(r => ({
      path: r.path,
      pageType: r.pageType,
      count: r._count,
    }));

    // 4) Top 5 countries
    const topCountriesRaw = await db.visit.groupBy({
      by: ['country', 'countryCode'],
      where: { createdAt: { gte: since }, country: { not: null } },
      _count: true,
      orderBy: { _count: { country: 'desc' } },
      take: 5,
    });
    const topCountries = topCountriesRaw.map(r => ({
      country: r.country,
      countryCode: r.countryCode,
      count: r._count,
    }));

    // 5) Top 5 referrer sources
    const topSourcesRaw = await db.visit.groupBy({
      by: ['referrerSource'],
      where: { createdAt: { gte: since }, referrerSource: { not: null } },
      _count: true,
      orderBy: { _count: { referrerSource: 'desc' } },
      take: 5,
    });
    const topSources = topSourcesRaw.map(r => ({
      source: r.referrerSource,
      count: r._count,
    }));

    // 6) Unique visitors (distinct ip hashes) in period
    const uniqueVisitorsRaw = await db.visit.groupBy({
      by: ['ip'],
      where: { createdAt: { gte: since }, ip: { not: null } },
    });
    const uniqueVisitors = uniqueVisitorsRaw.length;

    // 7) Today / 7d / 30d / all-time counts (for the 4 cards)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgoCard = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [today, week, month, allTime] = await Promise.all([
      db.visit.count({ where: { createdAt: { gte: todayStart } } }),
      db.visit.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.visit.count({ where: { createdAt: { gte: thirtyDaysAgoCard } } }),
      db.visit.count(),
    ]);

    return NextResponse.json({
      period,
      cards: { today, week, month, allTime },
      totalVisits,
      uniqueVisitors,
      daily,
      topPages,
      topCountries,
      topSources,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
