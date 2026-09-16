// ============================================================================
// Service — Contexte utilisateur autorisé (READ-ONLY, résolu serveur-side)
// ============================================================================
// Mission 2/3 — Étendu pour :
//   - walletSummary : solde + 10 dernières transactions (entrées/sorties).
//     IMPORTANT : totalCharges ne compte QUE les charges VALIDÉES (les PENDING
//     et REFUSÉES ne sont pas créditées au solde).
//   - attestationsSummary : attestations de l'utilisateur (statut + score).
//   - adminTargetContext : si admin ET message mentionne un autre utilisateur
//     avec un IDENTIFIANT UNIQUE (email OU téléphone — JAMAIS par nom seul),
//     contexte ciblé (résolu serveur-side).
//   - adminNeedsIdentity : si admin mentionne un user par nom seul, on ne
//     résout JAMAIS. Lara doit demander un email ou un téléphone.
// ============================================================================

import { db } from '@/lib/db';
import type {
  AuthorizedUserContext,
  WalletSummary,
  AttestationSummary,
  AdminTargetContext,
  AdminNeedsIdentity,
} from '../types';
import type { AuthUser } from '@/lib/auth';

// ============================================================================
// Helpers : extraction email + téléphone + parsing du message (admin only)
// ============================================================================

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+|00)?\d[\d\s.\-]{8,17}\d/g;

function extractEmailFromMessage(message: string): string | null {
  if (!message) return null;
  const matches = message.match(EMAIL_REGEX);
  return matches && matches.length > 0 ? matches[0].toLowerCase().trim() : null;
}

function normalizePhone(p: string): string {
  return p.replace(/[\s.\-()]/g, '');
}

function extractPhoneFromMessage(message: string): string | null {
  if (!message) return null;
  const matches = message.match(PHONE_REGEX);
  if (!matches || matches.length === 0) return null;
  return normalizePhone(matches[0]);
}

const ADMIN_QUERY_PATTERNS: RegExp[] = [
  /(?:montre(?:-moi)?|affiche|afficher|voir|consulte|consultez|vérifier?|donne(?:-moi)?|quelles?\s+sont|quels?\s+sont|informations?|infos?|détails?|compte|profil|wallet|solde|attestations?|inscriptions?|formations?|c'est qui|qui est)\s+/i,
  /(?:le|la|les|un|une|l'|d')?(?:compte|profil|wallet|solde|attestations?|inscriptions?|formations?)\s+(?:de|d')\s+/i,
];

function isAdminQueryPattern(message: string): boolean {
  for (const p of ADMIN_QUERY_PATTERNS) {
    if (p.test(message)) return true;
  }
  return false;
}

function extractTargetNameFromAdminMessage(message: string): string | null {
  if (!message) return null;
  const cleaned = message.replace(EMAIL_REGEX, ' ').replace(PHONE_REGEX, ' ');
  const match = cleaned.match(
    /\b(?:de|d'|du|de la|des)\s+([A-ZÀ-Ý][a-zA-ZÀ-ÿ'-]+(?:\s+[A-ZÀ-Ý][a-zA-ZÀ-ÿ'-]+){0,3})\b/
  );
  if (!match) return null;
  const candidate = match[1].trim();
  const excludedWords = new Set([
    'Mon', 'Ma', 'Mes', 'Ton', 'Ta', 'Tes', 'Son', 'Sa', 'Ses', 'Notre', 'Nos', 'Votre', 'Vos',
    'Leur', 'Leurs', 'Ce', 'Cette', 'Ces', 'Tout', 'Tous', 'Toute', 'Toutes',
    'Compte', 'Profil', 'Wallet', 'Solde', 'Attestations', 'Inscriptions', 'Formations',
    'User', 'Utilisateur', 'Admin', 'Administrateur',
    'Le', 'La', 'Les', 'Un', 'Une', 'Des', 'Du', 'De',
  ]);
  const firstWord = candidate.split(' ')[0];
  if (excludedWords.has(firstWord)) return null;
  if (candidate.length < 2) return null;
  return candidate;
}

// ============================================================================
// Wallet helpers
// ============================================================================

async function buildWalletSummary(userId: string): Promise<WalletSummary | undefined> {
  let wallet = await db.wallet.findUnique({
    where: { userId },
    include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } },
  });
  if (!wallet) {
    wallet = await db.wallet.create({ data: { userId }, include: { transactions: true } });
  }

  const allTx = await db.walletTransaction.findMany({
    where: { walletId: wallet.id },
    select: { type: true, amount: true, description: true },
  });
  let totalCharges = 0;
  let totalPurchases = 0;
  for (const t of allTx) {
    if (t.type === 'purchase') {
      totalPurchases += t.amount;
    } else if (t.type === 'charge') {
      const desc = t.description || '';
      const isValidated = /VALIDÉ/i.test(desc);
      const isRefused = /REFUSÉ/i.test(desc);
      const isPending = /EN\s+ATTENTE/i.test(desc);
      const isArchived = /ARCHIVÉ/i.test(desc);
      if (isValidated && !isRefused && !isPending && !isArchived) {
        totalCharges += t.amount;
      }
    } else if (t.type === 'bonus' || t.type === 'refund') {
      totalCharges += t.amount;
    }
  }

  return {
    balance: wallet.balance,
    currency: wallet.currency,
    recentTransactions: wallet.transactions.map(t => ({
      type: t.type,
      amount: t.amount,
      description: t.description || '',
      paymentMethod: t.paymentMethod || null,
      createdAt: t.createdAt.toISOString(),
    })),
    totalCharges,
    totalPurchases,
  };
}

// ============================================================================
// Contexte principal
// ============================================================================

export async function getAuthorizedContext(
  auth: AuthUser | null,
  options?: { adminMessage?: string }
): Promise<AuthorizedUserContext> {
  if (!auth) {
    return { isAuthenticated: false, userId: null, userName: null, userEmail: null, userRole: null };
  }

  const profile = await db.userProfile.findUnique({
    where: { userId: auth.id },
    select: { username: true, fullName: true, cvTitle: true, cvBio: true, cvTemplate: true, profilePublic: true },
  });

  const enrollments = await db.enrollment.findMany({
    where: { userId: auth.id, status: { in: ['active', 'completed'] } },
    include: { course: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const attestations = await db.courseAttestation.findMany({
    where: { userId: auth.id, status: 'valid' },
    select: { courseName: true, overallScore: true, issuedDate: true, serialNumber: true, attestationNo: true, status: true },
    orderBy: { issuedDate: 'desc' },
    take: 10,
  });

  const walletSummary = await buildWalletSummary(auth.id);

  const publicProfileUrl = profile?.username ? `https://hseacademy.online/@${profile.username}` : null;

  const context: AuthorizedUserContext = {
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
    attestationsSummary: attestations.map(a => ({
      courseName: a.courseName,
      score: a.overallScore,
      serialNumber: a.serialNumber,
      issuedDate: a.issuedDate?.toISOString?.() ?? '',
      status: a.status,
    })),
    walletSummary,
  };

  // === Mode ADMIN — contexte ciblé sur un autre utilisateur ===
  if (auth.role === 'admin' && options?.adminMessage) {
    if (isAdminQueryPattern(options.adminMessage)) {
      // 1) Tentative par EMAIL
      const targetEmail = extractEmailFromMessage(options.adminMessage);
      if (targetEmail && targetEmail !== auth.email.toLowerCase()) {
        const targetUser = await db.user.findUnique({
          where: { email: targetEmail },
          select: { id: true, name: true, email: true, role: true, phone: true },
        });
        if (targetUser && targetUser.id !== auth.id) {
          context.adminTargetContext = await buildAdminTargetContext(targetUser);
          return context;
        }
      }

      // 2) Tentative par TÉLÉPHONE
      const targetPhone = extractPhoneFromMessage(options.adminMessage);
      if (targetPhone) {
        const candidates = await db.user.findMany({
          where: { phone: { not: null } },
          select: { id: true, name: true, email: true, role: true, phone: true },
        });
        const targetUser = candidates.find(u =>
          u.phone && normalizePhone(u.phone) === targetPhone && u.id !== auth.id
        );
        if (targetUser) {
          context.adminTargetContext = await buildAdminTargetContext(targetUser);
          return context;
        }
      }

      // 3) Si nom seul détecté → adminNeedsIdentity (JAMAIS de résolution par nom)
      const targetName = extractTargetNameFromAdminMessage(options.adminMessage);
      if (targetName) {
        context.adminNeedsIdentity = { detectedName: targetName };
      }
    }
  }

  return context;
}

// ============================================================================
// Helper : construire le contexte ciblé admin
// ============================================================================

async function buildAdminTargetContext(targetUser: {
  id: string; name: string; email: string; role: string; phone: string | null;
}): Promise<AdminTargetContext> {
  const [targetWallet, targetEnrollments, targetAttestations] = await Promise.all([
    buildWalletSummary(targetUser.id),
    db.enrollment.findMany({
      where: { userId: targetUser.id, status: { in: ['active', 'completed'] } },
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    db.courseAttestation.findMany({
      where: { userId: targetUser.id, status: 'valid' },
      select: { courseName: true, overallScore: true, issuedDate: true, serialNumber: true, status: true },
      orderBy: { issuedDate: 'desc' },
      take: 10,
    }),
  ]);
  return {
    targetUserId: targetUser.id,
    targetUserName: targetUser.name,
    targetUserEmail: targetUser.email,
    targetUserRole: targetUser.role,
    targetUserPhone: targetUser.phone,
    walletSummary: targetWallet,
    enrollmentsSummary: targetEnrollments.map(e => ({
      courseTitle: e.course.title,
      status: e.status,
      overallScore: e.overallScore,
    })),
    attestationsSummary: targetAttestations.map(a => ({
      courseName: a.courseName,
      score: a.overallScore,
      serialNumber: a.serialNumber,
      issuedDate: a.issuedDate?.toISOString?.() ?? '',
      status: a.status,
    })),
  };
}

// ============================================================================
// Sérialisation pour le prompt LLM
// ============================================================================

const TX_TYPE_LABELS: Record<string, string> = {
  charge: 'Rechargement (entrée)',
  purchase: 'Achat (sortie)',
  refund: 'Remboursement (entrée)',
  bonus: 'Bonus (entrée)',
};

function getChargeStatus(description: string): 'VALIDÉ' | 'EN ATTENTE' | 'REFUSÉ' | 'ARCHIVÉ' | null {
  if (!description) return null;
  if (/VALIDÉ/i.test(description)) return 'VALIDÉ';
  if (/REFUSÉ/i.test(description)) return 'REFUSÉ';
  if (/EN\s+ATTENTE/i.test(description)) return 'EN ATTENTE';
  if (/ARCHIVÉ/i.test(description)) return 'ARCHIVÉ';
  return null;
}

export function serializeContextForPrompt(ctx: AuthorizedUserContext): string {
  if (!ctx.isAuthenticated) {
    return 'Visiteur non authentifié (mode commercial). Aucune donnée personnelle accessible.';
  }

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

  if (ctx.attestationsSummary && ctx.attestationsSummary.length > 0) {
    lines.push('Attestations (résumé lecture seule) :');
    for (const a of ctx.attestationsSummary.slice(0, 5)) {
      const scoreStr = a.score != null ? ` — score ${a.score}%` : '';
      const dateStr = a.issuedDate ? ` — ${new Date(a.issuedDate).toLocaleDateString('fr-FR')}` : '';
      lines.push(`  - ${a.courseName}${scoreStr} — ${a.serialNumber}${dateStr}`);
    }
    if (ctx.attestationsSummary.length > 5) {
      lines.push(`  - ... ${ctx.attestationsSummary.length - 5} autre(s) attestation(s)`);
    }
  }

  // === Wallet (solde + historique) ===
  if (ctx.walletSummary) {
    const w = ctx.walletSummary;
    lines.push('');
    lines.push('=== WALLET UTILISATEUR (lecture seule — PEUT LIRE ET EXPLIQUER) ===');
    lines.push(`Solde actuel : ${w.balance} ${w.currency}`);
    lines.push(`Total des entrées créditées (rechargements VALIDÉS + bonus + remboursements) : ${w.totalCharges} ${w.currency}`);
    lines.push(`Total des sorties (achats) : ${w.totalPurchases} ${w.currency}`);
    lines.push('NOTE : les rechargements EN ATTENTE ou REFUSÉS ne sont PAS crédités au solde.');
    if (w.recentTransactions.length > 0) {
      lines.push('10 dernières transactions :');
      for (const t of w.recentTransactions) {
        const label = TX_TYPE_LABELS[t.type] || t.type;
        const date = new Date(t.createdAt).toLocaleDateString('fr-FR');
        let statusSuffix = '';
        if (t.type === 'charge') {
          const status = getChargeStatus(t.description);
          if (status) statusSuffix = ` — ${status}`;
        }
        const desc = t.description ? ` — ${t.description}` : '';
        lines.push(`  - ${date} — ${label} — ${t.amount} ${w.currency}${statusSuffix}${desc}`);
      }
    } else {
      lines.push('Aucune transaction pour le moment.');
    }
  }

  // === Mode admin — demande d'identifiant unique ===
  if (ctx.adminNeedsIdentity && !ctx.adminTargetContext) {
    const ni = ctx.adminNeedsIdentity;
    lines.push('');
    lines.push('=== ADMIN — IDENTIFICATION REQUISE ===');
    lines.push(`L'admin a mentionné un utilisateur par son nom : "${ni.detectedName}".`);
    lines.push('Le nom N\'EST PAS un identifiant unique (plusieurs personnes peuvent avoir le même nom).');
    lines.push('NE JAMAIS essayer de deviner l\'utilisateur ou de le résoudre par son nom.');
    lines.push('Réponds à l\'admin : "Pouvez-vous me préciser son adresse e-mail ou son numéro de téléphone');
    lines.push('afin d\'identifier le bon utilisateur ?"');
  }

  // === Mode admin — contexte ciblé sur un autre utilisateur ===
  if (ctx.adminTargetContext) {
    const t = ctx.adminTargetContext;
    lines.push('');
    lines.push('=== CONTEXTE ADMIN — UTILISATEUR CIBLÉ (lecture seule) ===');
    lines.push(`Admin authentifié interroge les infos de : ${t.targetUserName} (${t.targetUserEmail})`);
    lines.push(`Rôle de la cible : ${t.targetUserRole}`);
    if (t.targetUserPhone) lines.push(`Téléphone de la cible : ${t.targetUserPhone}`);

    if (t.enrollmentsSummary && t.enrollmentsSummary.length > 0) {
      lines.push('Inscriptions de la cible :');
      for (const e of t.enrollmentsSummary.slice(0, 5)) {
        const score = e.overallScore ? ` — score ${e.overallScore}%` : '';
        lines.push(`  - ${e.courseTitle} (${e.status}${score})`);
      }
    }

    if (t.attestationsSummary && t.attestationsSummary.length > 0) {
      lines.push('Attestations de la cible :');
      for (const a of t.attestationsSummary.slice(0, 5)) {
        const scoreStr = a.score != null ? ` — score ${a.score}%` : '';
        const dateStr = a.issuedDate ? ` — ${new Date(a.issuedDate).toLocaleDateString('fr-FR')}` : '';
        lines.push(`  - ${a.courseName}${scoreStr} — ${a.serialNumber}${dateStr}`);
      }
    }

    if (t.walletSummary) {
      const w = t.walletSummary;
      lines.push('Wallet de la cible :');
      lines.push(`  Solde : ${w.balance} ${w.currency}`);
      lines.push(`  Total entrées créditées : ${w.totalCharges} ${w.currency}`);
      lines.push(`  Total sorties : ${w.totalPurchases} ${w.currency}`);
      if (w.recentTransactions.length > 0) {
        lines.push('  10 dernières transactions :');
        for (const tx of w.recentTransactions) {
          const label = TX_TYPE_LABELS[tx.type] || tx.type;
          const date = new Date(tx.createdAt).toLocaleDateString('fr-FR');
          let statusSuffix = '';
          if (tx.type === 'charge') {
            const status = getChargeStatus(tx.description);
            if (status) statusSuffix = ` — ${status}`;
          }
          const desc = tx.description ? ` — ${tx.description}` : '';
          lines.push(`    - ${date} — ${label} — ${tx.amount} ${w.currency}${statusSuffix}${desc}`);
        }
      }
    }
  }

  return lines.join('\n');
}
