import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /sitemap.xml — sitemap index (points to sitemap-pages, sitemap-formations, sitemap-articles, sitemap-static)
export async function GET() {
  try {
    const profile = await db.siteProfile.findUnique({ where: { id: 'default' } });
    const baseUrl = (profile?.siteUrl || 'https://hseacademy.online').replace(/\/$/, '');
    const todayStr = new Date().toISOString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
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

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>', {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
