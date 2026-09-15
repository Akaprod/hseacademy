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
//
// RÈGLE D'IDENTITÉ CRITIQUE (Mission 3) :
//   - EMAIL = identifiant unique (User.email @unique en DB).
//   - TÉLÉPHONE = identifiant unique (en pratique — pas de doublon en DB).
//   - NOM/PRÉNOM = JAMAIS un identifiant unique. Ne JAMAIS résoudre un user
//     par son nom, même si un seul "Farid" existe en DB.
//
// SÉCURITÉ ABSOLUE :
//   - Toutes les permissions sont déterminées côté serveur (auth.role).
//   - NE JAMAIS trust un email/ID/nom fourni par le frontend ou le message.
//   - Pour le mode admin, on parse l'email OU le téléphone dans le message
//     DE L'AUTEUR DE LA REQUÊTE (déjà authentifié comme admin côté serveur),
//     puis on résout côté serveur les infos de l'utilisateur ciblé.
//   - Un USER normal ne JAMAIS accéder aux données d'un autre utilisateur,
//     même s'il fournit un email, un téléphone ou un nom dans son message.
// ============================================================================

import { db } from '@/lib/db';
import type {
  AuthorizedUserContext,
  WalletSummary,
  WalletTransactionSummary,
  AttestationSummary,
  AdminTargetContext,
  AdminNeedsIdentity,
} from '../types';
import type { AuthUser } from '@/lib/auth';

// ============================================================================
// Helpers : extraction email + téléphone + parsing du message (admin only)
// ============================================================================

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Téléphone : formats internationaux courants
// - +212XXXXXXXXX (Maroc)
// - +33XXXXXXXXX (France)
// - 0XXXXXXXXX (formats locaux à 10 chiffres)
// - +XX XXX XX XX XX (formats avec espaces)
// On normalise en retirant espaces, points, tirets pour le lookup DB.
const PHONE_REGEX = /(?:\+|00)?\d[\d\s.\-]{8,17}\d/g;

/** Extrait le premier email valide trouvé dans un texte. */
function extractEmailFromMessage(message: string): string | null {
  if (!message) return null;
  const matches = message.match(EMAIL_REGEX);
  return matches && matches.length > 0 ? matches[0].toLowerCase().trim() : null;
}

/** Normalise un numéro de téléphone (retire espaces, points, tirets). */
function normalizePhone(p: string): string {
  return p.replace(/[\s.\-()]/g, '');
}

/** Extrait le premier numéro de téléphone valide trouvé dans un texte. */
function extractPhoneFromMessage(message: string): string | null {
  if (!message) return null;
  const matches = message.match(PHONE_REGEX);
  if (!matches || matches.length === 0) return null;
  // Retourne le premier match normalisé
  return normalizePhone(matches[0]);
}

/**
 * Patterns d'interrogation admin reconnus pour cibler un autre utilisateur.
 * On est volontairement conservateur : il faut un verbe d'action explicite
 * (montre, voir, consulte, donne, quelles sont, infos, détails, etc.) suivi
 * d'une préposition (de, sur, concernant, pour) ou directement un nom/email.
 */
const ADMIN_QUERY_PATTERNS: RegExp[] = [
  /(?:montre(?:-moi)?|affiche|afficher|voir|consulte|consultez|vérifier?|donne(?:-moi)?|quelles?\s+sont|quels?\s+sont|informations?|infos?|détails?|compte|profil|wallet|solde|attestations?|inscriptions?|formations?)\s+(?:de|sur|du|de la|concernant|pour|d')\s+/i,
  /(?:le|la|les|un|une|l'|d')?(?:compte|profil|wallet|solde|attestations?|inscriptions?|formations?)\s+(?:de|d')\s+/i,
];

function isAdminQueryPattern(message: string): boolean {
  for (const p of ADMIN_QUERY_PATTERNS) {
    if (p.test(message)) return true;
  }
  return false;
}

/**
 * Tente d'extraire un nom de personne depuis le message admin.
 *
 * IMPORTANT (Mission 3) : cette fonction NE SERT PLUS à résoudre un user en DB.
 * Elle sert UNIQUEMENT à détecter l'intention du message ("l'admin mentionne
 * un autre user par nom") pour que Lara puisse demander un identifiant unique
 * (email ou téléphone) pour l'identifier formellement.
 *
 * Exemples reconnus :
 *   "Montre-moi le solde de Farid" → "Farid"
 *   "Donne-moi les infos de Ahmed Benali" → "Ahmed Benali"
 *   "Quelles sont les attestations de Aminata Diop ?" → "Aminata Diop"
 */
function extractTargetNameFromAdminMessage(message: string): string | null {
  if (!message) return null;

  // Nettoyer le message : retirer les emails et téléphones (gérés à part)
  const cleaned = message.replace(EMAIL_REGEX, ' ').replace(PHONE_REGEX, ' ');

  // Chercher un pattern "de <Name>" ou "de la <Name>" etc.
  // On accepte les noms avec accents et espaces, capitalisés.
  // Match : "de" + espace + (mot capitalisé) + éventuellement d'autres mots capitalisés.
  const match = cleaned.match(
    /\b(?:de|d'|du|de la|des)\s+([A-ZÀ-Ý][a-zA-ZÀ-ÿ'-]+(?:\s+[A-ZÀ-Ý][a-zA-ZÀ-ÿ'-]+){0,3})\b/
  );
  if (!match) return null;

  const candidate = match[1].trim();

  // Exclure les mots vides courants (l'admin peut écrire "de mon compte" sans viser un autre user)
  const excludedWords = new Set([
    'Mon', 'Ma', 'Mes', 'Ton', 'Ta', 'Tes', 'Son', 'Sa', 'Ses', 'Notre', 'Nos', 'Votre', 'Vos',
    'Leur', 'Leurs', 'Ce', 'Cette', 'Ces', 'Tout', 'Tous', 'Toute', 'Toutes',
    'Compte', 'Profil', 'Wallet', 'Solde', 'Attestations', 'Inscriptions', 'Formations',
    'User', 'Utilisateur', 'Admin', 'Administrateur',
    'Le', 'La', 'Les', 'Un', 'Une', 'Des', 'Du', 'De',
    // Mots communs qui ne sont pas des prénoms/noms
    'Cours', 'Sessions', 'Programme', 'Formation', 'Cursus',
    'Paiement', 'Paiements', 'Certificat', 'Certificats', 'Diplôme', 'Diplômes',
  ]);
  const firstWord = candidate.split(' ')[0];
  if (excludedWords.has(firstWord)) return null;

  // Vérifier qu'il y a au moins 2 caractères
  if (candidate.length < 2) return null;

  return candidate;
}

// ============================================================================
// Wallet helpers
// ============================================================================
// AUDIT 3 — Constats clés sur le vrai modèle Wallet :
//   1. Le solde (`wallet.balance`) est TOUJOURS la source de vérité.
//   2. Une transaction `charge` est créée immédiatement en PENDING (description
//      contient "EN ATTENTE DE VALIDATION"). Le solde n'est PAS crédité.
//   3. À la validation admin :
//      - La `charge` est updatée (description devient "VALIDÉ")
//      - Le solde est crédité (charge.amount + bonus éventuel)
//      - Une transaction `bonus` est créée SI amount >= 500 MAD (5% ou 10%)
//   4. Une `charge` REFUSÉE (description "REFUSÉ") ne crédite jamais le solde.
//   5. `bonus` est TOUJOURS créé en même temps que la charge VALIDÉE — donc
//      tout bonus en DB correspond à une entrée réellement créditée.
//   6. `purchase` est TOUJOURS un débit immédiat (cours payé via Wallet).
//   7. `refund` n'est JAMAIS créé par aucune route actuellement. On garde le
//      type dans le calcul pour permettre un futur usage (remboursement admin),
//      mais on NE L'INVENTE JAMAIS.
//
// Conséquence pour `totalCharges` : il ne faut PAS sommer naïvement toutes
// les `charge + bonus + refund` — il faut exclure les charges EN ATTENTE et
// les charges REFUSÉES. On garde uniquement :
//   - charges dont la description contient "VALIDÉ" (et pas REFUSÉ/PENDING/ARCHIVED)
//   - tous les bonus (toujours liés à une charge validée)
//   - tous les refund (futur — si une route les crée un jour)
// ============================================================================

async function buildWalletSummary(userId: string): Promise<WalletSummary | undefined> {
  let wallet = await db.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!wallet) {
    // Si pas de wallet, on en crée un vide (même logique que /api/wallet)
    wallet = await db.wallet.create({
      data: { userId },
      include: { transactions: true },
    });
  }

  // Calculer totaux à partir de TOUTES les transactions (pas seulement 10 récentes)
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
      // IMPORTANT : ne compter que les charges VALIDÉES (les PENDING et REFUSÉES
      // n'ont pas crédité le solde — les inclure fausserait l'explication).
      const desc = t.description || '';
      const isValidated = /VALIDÉ/i.test(desc);
      const isRefused = /REFUSÉ/i.test(desc);
      const isPending = /EN\s+ATTENTE/i.test(desc);
      const isArchived = /ARCHIVÉ/i.test(desc);
      // Si la description mentionne un statut, on ne compte que VALIDÉ.
      // Si aucune mention de statut (anciennes transactions ou format inattendu),
      // on est conservateur et on NE compte PAS (préférons sous-estimer que surestimer).
      if (isValidated && !isRefused && !isPending && !isArchived) {
        totalCharges += t.amount;
      }
    } else if (t.type === 'bonus' || t.type === 'refund') {
      // Bonus est TOUJOURS créé en même temps qu'une charge VALIDÉE — donc toujours crédité.
      // Refund n'existe pas en pratique mais serait une entrée crédite (futur).
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
      status: true,
    },
    orderBy: { issuedDate: 'desc' },
    take: 10,
  });

  // Phase 3.2 : Wallet (solde + 10 dernières transactions)
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

  // === Phase 3.2/3.3 : Mode ADMIN — contexte ciblé sur un autre utilisateur ===
  // Résolution 100% serveur-side. On NE TRUST PAS :
  //   - le mode envoyé par le frontend (resolveMode le gère déjà)
  //   - l'email fourni dans le message (on le parse mais on vérifie en DB)
  //   - le téléphone fourni dans le message (idem — vérification en DB)
  //   - l'ID fourni dans le message (jamais utilisé)
  //   - un éventuel rôle fourni dans le message (vérification auth.role côté serveur)
  //
  // RÈGLE D'IDENTITÉ CRITIQUE (Mission 3) :
  //   - Seuls EMAIL et TÉLÉPHONE sont des identifiants uniques acceptés pour
  //     construire adminTargetContext.
  //   - Si l'admin mentionne un user par NOM seul, on NE RÉSOUT PAS — on met
  //     adminNeedsIdentity pour que Lara demande un email ou un téléphone.
  //   - On ne fait JAMAIS de recherche par nom en DB, MÊME si un seul user
  //     correspond (un nom n'est pas un identifiant fiable).
  //
  // Un USER normal n'entre jamais ici car on vérifie auth.role === 'admin'.
  if (auth.role === 'admin' && options?.adminMessage) {
    // Vérifier qu'on a un pattern d'interrogation (évite déclencher sur un simple "Bonjour X")
    if (isAdminQueryPattern(options.adminMessage)) {
      // 1) Tentative par EMAIL d'abord (priorité — identifiant unique le plus fiable)
      const targetEmail = extractEmailFromMessage(options.adminMessage);
      if (targetEmail && targetEmail !== auth.email.toLowerCase()) {
        const targetUser = await db.user.findUnique({
          where: { email: targetEmail },
          select: { id: true, name: true, email: true, role: true, phone: true },
        });
        if (targetUser && targetUser.id !== auth.id) {
          // Construire le contexte ciblé
          context.adminTargetContext = await buildAdminTargetContext(targetUser);
          return context;
        }
        // Si l'email n'existe pas en DB, on ne fait rien — Lara dira "utilisateur non trouvé".
      }

      // 2) Tentative par TÉLÉPHONE (identifiant unique alternatif)
      const targetPhone = extractPhoneFromMessage(options.adminMessage);
      if (targetPhone) {
        // Recherche en DB : on normalise le téléphone du user aussi pour comparer.
        // On récupère tous les users avec un phone non null et on compare normalized.
        // (Le phone n'est pas @unique en DB mais en pratique il n'y a pas de doublons.)
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
        // Si le téléphone n'existe pas en DB, on ne fait rien.
      }

      // 3) Si on arrive ici, ni email ni téléphone n'ont permis de résoudre.
      //    Vérifier si l'admin a mentionné un nom — auquel cas on demande un identifiant.
      //    On NE FAIT JAMAIS de recherche par nom en DB.
      const targetName = extractTargetNameFromAdminMessage(options.adminMessage);
      if (targetName) {
        // L'admin a mentionné un user par nom seul — on ne résout pas.
        // On signale à Lara qu'elle doit demander un email ou un téléphone.
        context.adminNeedsIdentity = { detectedName: targetName };
      }
      // Sinon : pas de nom détecté, pas d'email, pas de téléphone → rien.
      // Lara répondra "utilisateur non trouvé" ou "précisez votre demande".
    }
  }

  return context;
}

// ============================================================================
// Helper : construire le contexte ciblé admin pour un utilisateur donné
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
// IMPORTANT : "lecture seule" signifie que Lara PEUT LIRE et EXPLIQUER les
// données autorisées fournies dans ce contexte. Elle ne peut PAS les modifier.
// Ne jamais interpréter "lecture seule" comme "aucune donnée accessible".
// ============================================================================

const TX_TYPE_LABELS: Record<string, string> = {
  charge: 'Rechargement (entrée)',
  purchase: 'Achat (sortie)',
  refund: 'Remboursement (entrée)',
  bonus: 'Bonus (entrée)',
};

/** Détermine le statut d'une transaction `charge` à partir de sa description. */
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

  // Attestations
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

  // === Phase 3.2 : Wallet (solde + historique) ===
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
        // Afficher le statut pour les charges (VALIDÉ / EN ATTENTE / REFUSÉ)
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

  // === Phase 3.3 : Mode admin — demande d'identifiant unique ===
  // IMPORTANT (Mission 3) : si l'admin mentionne un user par nom seul,
  // on ne résout JAMAIS. On lui demande un email ou un téléphone pour
  // identifier formellement l'utilisateur ciblé.
  if (ctx.adminNeedsIdentity && !ctx.adminTargetContext) {
    const ni = ctx.adminNeedsIdentity;
    lines.push('');
    lines.push('=== ADMIN — IDENTIFICATION REQUISE ===');
    lines.push(`L'admin a mentionné un utilisateur par son nom : "${ni.detectedName}".`);
    lines.push('Le nom N\'EST PAS un identifiant unique (plusieurs personnes peuvent avoir le même nom).');
    lines.push('NE JAMAIS essayer de deviner l\'utilisateur ou de le résoudre par son nom.');
    lines.push('Réponds à l\'admin : "Pouvez-vous me préciser son adresse e-mail ou son numéro de téléphone');
    lines.push('afin d\'identifier le bon utilisateur ?"');
    lines.push('Attends ensuite un identifiant unique (email OU téléphone) de la part de l\'admin.');
    lines.push('Si l\'admin fournit un email OU un téléphone dans le message suivant, le serveur résoudra');
    lines.push('côté DB et fournira une section "CONTEXTE ADMIN — UTILISATEUR CIBLÉ" dans le contexte.');
  }

  // === Phase 3.2 : Mode admin — contexte ciblé sur un autre utilisateur ===
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
