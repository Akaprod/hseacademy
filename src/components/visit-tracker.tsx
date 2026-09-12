'use client';

import { useEffect } from 'react';

// ============================================================================
// VisitTracker — Tracker maison
// ============================================================================
// Injecté dans layout.tsx — track chaque visite de page côté client.
// Envoie POST /api/track avec: path, pageType, sessionId
// - path est déduit de window.location.pathname
// - pageType est déterminé par le path:
//     "/" → "home"
//     "/f/[slug]" → "formation"
//     "/pages/[slug]" → "page_seo"
//     "/@username" ou "/users/[username]" → "cv_public"
//     "/pages" → "pages_list"
//     "/terms", "/privacy", "/refund" → "legal"
//     autre → "other"
// - sessionId est stocké en localStorage (anonymous session id)
// ============================================================================

function getPageType(path: string): string {
  if (path === '/') return 'home';
  if (path.startsWith('/f/')) return 'formation';
  if (path.match(/^\/pages\/[^/]+$/)) return 'page_seo';
  if (path === '/pages') return 'pages_list';
  if (path.match(/^\/@[^/]+$/)) return 'cv_public';
  if (path.match(/^\/users\/[^/]+$/)) return 'cv_public';
  if (['/terms', '/privacy', '/refund'].includes(path)) return 'legal';
  return 'other';
}

function getSessionId(): string {
  try {
    const KEY = 'hsea_session_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
      // Generate a random session ID
      id = 'sess_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'sess_fallback';
  }
}

export function VisitTracker() {
  useEffect(() => {
    // Skip tracking for bots (basic heuristic)
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
      return;
    }

    // Skip in development
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const path = window.location.pathname + window.location.search;
    const pageType = getPageType(window.location.pathname);
    const sessionId = getSessionId();

    // Fire-and-forget tracking (no await — don't block page render)
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, pageType, sessionId }),
      keepalive: true,
    }).catch(() => {
      // Silently ignore tracking errors
    });
  }, []);

  return null;
}
