import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHmac } from 'node:crypto';

// POST /api/track — enregistre une visite
// Body: { path, pageType, sessionId }
// Identifie referrer + géolocalise IP via ip-api.com
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, pageType, sessionId } = body;

    if (!path || !pageType) {
      return NextResponse.json({ error: 'path et pageType requis' }, { status: 400 });
    }

    // --- Referrer analysis ---
    const referrer = request.headers.get('referer') || null;
    let referrerSource: string | null = null;
    if (referrer) {
      const refLower = referrer.toLowerCase();
      if (refLower.includes('google.')) referrerSource = 'google';
      else if (refLower.includes('bing.com')) referrerSource = 'bing';
      else if (refLower.includes('facebook.com') || refLower.includes('fb.com')) referrerSource = 'facebook';
      else if (refLower.includes('t.co') || refLower.includes('twitter.com') || refLower.includes('x.com')) referrerSource = 'twitter';
      else if (refLower.includes('linkedin.com')) referrerSource = 'linkedin';
      else if (refLower.includes('instagram.com')) referrerSource = 'instagram';
      else if (refLower.includes('youtube.com')) referrerSource = 'youtube';
      else if (refLower.includes('hseacademy.online')) referrerSource = 'direct'; // internal navigation
      else referrerSource = 'other';
    } else {
      referrerSource = 'direct'; // no referrer = direct access
    }

    // --- IP hash (privacy) ---
    const rawIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '0.0.0.0';
    const secret = process.env.AUTH_SECRET || 'fallback-secret-for-hashing';
    const ipHash = createHmac('sha256', secret).update(rawIp).digest('hex').slice(0, 32); // truncated hash

    // --- User Agent ---
    const userAgent = request.headers.get('user-agent') || null;

    // --- Geolocation via ip-api.com (free, no key) ---
    let country: string | null = null;
    let countryCode: string | null = null;
    let city: string | null = null;
    try {
      // Skip geolocation for localhost / private IPs
      if (rawIp && rawIp !== '0.0.0.0' && !rawIp.startsWith('127.') && !rawIp.startsWith('10.') && !rawIp.startsWith('192.168.')) {
        const geoUrl = `http://ip-api.com/json/${rawIp}?fields=status,country,countryCode,city&lang=fr`;
        const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(3000) });
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.status === 'success') {
            country = geo.country || null;
            countryCode = geo.countryCode || null;
            city = geo.city || null;
          }
        }
      }
    } catch {
      // Geolocation failed — keep country null (graceful degradation)
    }

    // --- Save visit ---
    await db.visit.create({
      data: {
        path: String(path).slice(0, 500),
        pageType: String(pageType).slice(0, 50),
        referrer: referrer ? referrer.slice(0, 500) : null,
        referrerSource,
        ip: ipHash,
        userAgent: userAgent ? userAgent.slice(0, 500) : null,
        country,
        countryCode,
        city: city ? city.slice(0, 100) : null,
        sessionId: sessionId ? String(sessionId).slice(0, 100) : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    // Silently fail (we don't want tracking errors to affect the user experience)
    console.error('Track error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
