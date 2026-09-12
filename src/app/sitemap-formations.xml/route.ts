import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /sitemap-formations.xml — 20 formations (diplomantes + certifiantes)
export async function GET() {
  try {
    const profile = await db.siteProfile.findUnique({ where: { id: 'default' } });
    const baseUrl = (profile?.siteUrl || 'https://hseacademy.online').replace(/\/$/, '');
    const urlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const formations = await db.formation.findMany({
      where: { archived: false },
      select: { slug: true, seoSlug: true, updatedAt: true },
      orderBy: { order: 'asc' },
    });

    const urls = formations.map(f => `  <url>
    <loc>${baseUrl}/f/${urlEscape(f.seoSlug || f.slug)}</loc>
    <lastmod>${f.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
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
