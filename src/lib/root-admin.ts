import { db } from './db';

// ============================================================================
// ROOT ADMIN — Protection du compte administrateur principal
// ============================================================================
//
// Le compte ROOT est l'administrateur principal qui ne peut jamais être
// supprimé ni rétrogradé. Cette protection est OBLIGATOIRE pour éviter
// de perdre tout accès administrateur à la plateforme.
//
// Identification du ROOT (par ordre de priorité) :
//   1. Variable d'environnement ROOT_ADMIN_EMAIL (recommandée, stable)
//      → L'utilisateur configure lui-même cette valeur dans .env
//      → Aucune migration DB nécessaire
//      → Aucune hardcoded value (je ne choisis pas l'email)
//
//   2. Fallback automatique : l'admin le plus ancien (premier inscrit)
//      → Utilisé si ROOT_ADMIN_EMAIL n'est pas défini
//      → Protection minimale garantie même sans configuration
//
// Safety net supplémentaire :
//   - isLastAdmin() empêche de supprimer/rétrograder le DERNIER admin
//     (évite le lockout complet de l'administration)
//
// Ces protections sont DOUBLÉES côté API (lib/root-admin.ts) et côté UI
// (admin-dashboard.tsx). L'API est la source de vérité — l'UI est
// uniquement une aide visuelle.
// ============================================================================

/**
 * Email du ROOT admin configuré via env (optionnel).
 * Si non défini, le fallback "admin le plus ancien" est utilisé.
 */
const ROOT_ADMIN_EMAIL = process.env.ROOT_ADMIN_EMAIL?.trim().toLowerCase() || '';

/**
 * Vérifie si un utilisateur est le ROOT admin (compte protégé immuable).
 *
 * Logique :
 *   1. Si ROOT_ADMIN_EMAIL est défini → comparer avec l'email du user
 *   2. Sinon → identifier l'admin le plus ancien (createdAt asc) et comparer l'ID
 *
 * @param userId ID de l'utilisateur à tester
 * @returns true si l'utilisateur est le ROOT admin
 */
export async function isRootAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  // Cas 1 : identification par email (recommandé, configurable)
  if (ROOT_ADMIN_EMAIL) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) return false;
    return user.email.toLowerCase() === ROOT_ADMIN_EMAIL;
  }

  // Cas 2 : fallback — l'admin le plus ancien
  const oldestAdmin = await db.user.findFirst({
    where: { role: 'admin' },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  return oldestAdmin?.id === userId;
}

/**
 * Vérifie si un utilisateur est le DERNIER admin.
 * Utilisé pour empêcher le lockout (suppression ou rétrogradation
 * du dernier admin restant).
 *
 * @param userId ID de l'utilisateur à tester
 * @returns true si l'utilisateur est le dernier admin
 */
export async function isLastAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  const adminCount = await db.user.count({ where: { role: 'admin' } });
  if (adminCount > 1) return false;

  // Un seul admin — vérifier si c'est celui-ci
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === 'admin';
}

/**
 * Retourne un identifiant lisible du ROOT (pour logs / debug).
 * Ne expose JAMAIS l'email en clair dans les logs publics.
 */
export function getRootAdminIdentifier(): string {
  if (ROOT_ADMIN_EMAIL) {
    // Masquer partiellement l'email pour les logs
    const [local, domain] = ROOT_ADMIN_EMAIL.split('@');
    if (local && domain) {
      const maskedLocal = local.length > 2
        ? local.slice(0, 2) + '*'.repeat(Math.max(0, local.length - 2))
        : '*'.repeat(local.length);
      return `email=${maskedLocal}@${domain}`;
    }
    return 'email=(invalid format)';
  }
  return 'fallback=oldest-admin';
}

/**
 * Vérifie si ROOT_ADMIN_EMAIL est configuré.
 * Utile pour afficher un warning dans l'admin dashboard.
 */
export function isRootAdminEmailConfigured(): boolean {
  return ROOT_ADMIN_EMAIL.length > 0;
}
