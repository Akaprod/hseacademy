// ============================================================================
// Service — Contexte utilisateur autorisé (READ-ONLY, résolu serveur-side)
// ============================================================================
// Phase 3 : élargissement — l'assistant peut maintenant lire :
// - profil public (déjà en Phase 1+2)
// - inscriptions + progression (déjà en Phase 1+2)
// - attestations de l'utilisateur (read-only)
// Tout est limité à l'utilisateur authentifié — jamais les données d'un autre.
// ============================================================================

import { db } from '@/lib/db';
import type { AuthorizedUserContext } from '../types';
import type { AuthUser } from '@/lib/auth';

export async function getAuthorizedContext(auth: AuthUser | null): Promise<AuthorizedUserContext> {
  if (!auth) {
    return { isAuthenticated: false, userId: null, userName: null, userEmail: null, userRole: null };
  }

  // Profil public (déjà visible sur le CV public de l'utilisateur)
  const profile = await db.userProfile.findUnique({
    where: { userId: auth.id },
    select: { username: true, fullName: true, cvTitle: true, cvBio: true, cvTemplate: true, profilePublic: true },
  });

  // Inscriptions (read-only — visibles dans "Mes formations")
  const enrollments = await db.enrollment.findMany({
    where: { userId: auth.id, status: { in: ['active', 'completed'] } },
    include: { course: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Phase 3 : Attestations (read-only — visibles dans "Mes attestations")
  const attestations = await db.courseAttestation.findMany({
    where: { userId: auth.id, status: 'valid' },
    select: {
      courseName: true,
      overallScore: true,
      issuedDate: true,
      serialNumber: true,
      attestationNo: true,
    },
    orderBy: { issuedDate: 'desc' },
    take: 10,
  });

  const publicProfileUrl = profile?.username ? `https://hseacademy.online/@${profile.username}` : null;

  return {
    isAuthenticated: true,
    userId: auth.id,
    userName: auth.name,
    userEmail: auth.email,
    userRole: auth.role as 'user' | 'admin',
    profilePublicInfo: profile ? {
      fullName: profile.fullName,
      cvTitle: profile.cvTitle,
      cvBio: profile.cvBio,
      cvTemplate: profile.cvTemplate,
      publicProfileUrl,
    } : undefined,
    enrollmentsSummary: enrollments.map(e => ({
      courseTitle: e.course.title,
      status: e.status,
      overallScore: e.overallScore,
    })),
    // Phase 3 : attestations en read-only
    attestationsSummary: attestations.map(a => ({
      courseName: a.courseName,
      score: a.overallScore,
      serialNumber: a.serialNumber,
      issuedDate: a.issuedDate?.toISOString?.() ?? '',
    })),
  } as AuthorizedUserContext;
}

export function serializeContextForPrompt(ctx: AuthorizedUserContext): string {
  if (!ctx.isAuthenticated) return 'Visiteur non authentifié (mode commercial).';

  const lines: string[] = [
    `Utilisateur authentifié : ${ctx.userName} (${ctx.userEmail})`,
    `Rôle : ${ctx.userRole}`,
  ];

  if (ctx.profilePublicInfo) {
    const p = ctx.profilePublicInfo;
    if (p.fullName) lines.push(`Nom complet : ${p.fullName}`);
    if (p.cvTitle) lines.push(`Titre CV : ${p.cvTitle}`);
    if (p.cvTemplate) lines.push(`Template CV : ${p.cvTemplate}`);
    if (p.publicProfileUrl) lines.push(`URL CV public : ${p.publicProfileUrl}`);
  }

  if (ctx.enrollmentsSummary && ctx.enrollmentsSummary.length > 0) {
    lines.push('Inscriptions (résumé lecture seule) :');
    for (const e of ctx.enrollmentsSummary.slice(0, 5)) {
      const score = e.overallScore ? ` — score ${e.overallScore}%` : '';
      lines.push(`  - ${e.courseTitle} (${e.status}${score})`);
    }
    if (ctx.enrollmentsSummary.length > 5) {
      lines.push(`  - ... ${ctx.enrollmentsSummary.length - 5} autre(s) inscription(s)`);
    }
  }

  // Phase 3 : Attestations
  const atts = (ctx as any).attestationsSummary;
  if (atts && atts.length > 0) {
    lines.push('Attestations (résumé lecture seule) :');
    for (const a of atts.slice(0, 5)) {
      lines.push(`  - ${a.courseName} — score ${a.score}% — ${a.serialNumber} — ${a.issuedDate ? new Date(a.issuedDate).toLocaleDateString('fr-FR') : ''}`);
    }
  }

  return lines.join('\n');
}
