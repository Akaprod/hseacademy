import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /sitemap-static.xml — pages statiques (home, base de connaissances, legal) + CV publics
export async function GET() {
  try {
    const profile = await db.siteProfile.findUnique({ where: { id: 'default' } });
    const baseUrl = (profile?.siteUrl || 'https://hseacademy.online').replace(/\/$/, '');
    const urlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const todayStr = new Date().toISOString();

    // CV publics des utilisateurs
    const users = await db.userProfile.findMany({
      where: { profilePublic: true, username: { not: null } },
      select: { username: true, updatedAt: true },
    });

    const staticUrls = [
      `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
      `  <url>
    <loc>${baseUrl}/pages</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
      `  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`,
      `  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`,
      `  <url>
    <loc>${baseUrl}/refund</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`,
    ];

    const userUrls = users.map(u => `  <url>
    <loc>${baseUrl}/@${urlEscape(u.username!)}</loc>
    <lastmod>${u.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);

    const allUrls = [...staticUrls, ...userUrls].join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
