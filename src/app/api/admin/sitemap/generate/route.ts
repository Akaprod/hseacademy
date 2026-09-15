import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// POST /api/admin/sitemap/generate — génère le sitemap.xml + ping Google
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const profile = await db.siteProfile.findUnique({ where: { id: 'default' } });
    const baseUrl = (profile?.siteUrl || 'https://hseacademy.online').replace(/\/$/, '');

    // Gather all URLs from DB
    const [formations, pages, articles, users] = await Promise.all([
      db.formation.findMany({
        where: { archived: false },
        select: { slug: true, seoSlug: true, updatedAt: true },
      }),
      db.page.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      db.article.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      db.userProfile.findMany({
        where: { profilePublic: true, username: { not: null } },
        select: { username: true, updatedAt: true },
      }),
    ]);

    const todayStr = new Date().toISOString();
    const urlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    // --- Generate sitemap-pages.xml (12 pages SEO) ---
    const pagesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseUrl}/pages/${urlEscape(p.slug)}</loc>
    <lastmod>${p.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    // --- Generate sitemap-formations.xml (20 formations) ---
    const formationsXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${formations.map(f => `  <url>
    <loc>${baseUrl}/f/${urlEscape(f.seoSlug || f.slug)}</loc>
    <lastmod>${f.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
</urlset>`;

    // --- Generate sitemap-articles.xml (37 articles) ---
    const articlesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${articles.map(a => `  <url>
    <loc>${baseUrl}/?article=${urlEscape(a.slug)}</loc>
    <lastmod>${a.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

    // --- Generate sitemap-static.xml (static pages: home, list, legal) ---
    const staticXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/pages</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/refund</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
${users.map(u => `  <url>
    <loc>${baseUrl}/@${urlEscape(u.username!)}</loc>
    <lastmod>${u.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n')}
</urlset>`;

    // --- Generate sitemap.xml (index) ---
    const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-formations.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-articles.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
</sitemapindex>`;

    // Save metadata in SiteProfile (the actual XML is generated dynamically by /sitemap.xml route)
    await db.siteProfile.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        sitemapUrl: `${baseUrl}/sitemap.xml`,
        sitemapUpdatedAt: new Date(),
      },
      update: {
        sitemapUrl: `${baseUrl}/sitemap.xml`,
        sitemapUpdatedAt: new Date(),
      },
    });

    // --- Ping Google Webmaster Tools to notify them about the new sitemap ---
    let pingResult: 'ok' | 'fail' | 'skipped' = 'skipped';
    try {
      const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${baseUrl}/sitemap.xml`)}`;
      const pingRes = await fetch(pingUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
      pingResult = pingRes.ok ? 'ok' : 'fail';
    } catch {
      pingResult = 'fail';
    }

    // Stats about what was generated
    return NextResponse.json({
      success: true,
      sitemapUrl: `${baseUrl}/sitemap.xml`,
      generatedAt: todayStr,
      counts: {
        pages: pages.length,
        formations: formations.length,
        articles: articles.length,
        users: users.length,
        staticPages: 5,
        total: pages.length + formations.length + articles.length + users.length + 5,
      },
      pingGoogle: pingResult,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
