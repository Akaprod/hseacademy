// ============================================================================
// RESERVED USERNAMES — Liste des usernames publics interdits
// ============================================================================
// Ces mots ne peuvent pas être choisis comme username de lien public CV :
//   - Rôles/titres professionnels (directeur, manager, etc.)
//   - Termes QHSE / Normes ISO (iso9001, hse, qhse, etc.)
//   - Termes réservés techniques / administratifs (admin, root, support, etc.)
//   - Mots liés à la plateforme (iicp, hseacademy, etc.)
//
// Règles :
//   - Les usernames déjà pris AVANT l'ajout de cette liste NE SONT PAS invalidés
//     (pas de rétro-validation).
//   - Les ADMINS peuvent bypasser cette liste (peuvent choisir n'importe quel
//     username, même réservé).
//   - Comparaison insensible à la casse (case-insensitive).
//   - Si un user veut un username réservé, il doit faire une demande explicite
//     (procédure manuelle via l'admin).
// ============================================================================

export const RESERVED_USERNAMES: readonly string[] = [
  // ---- Rôles / titres professionnels ----
  'directeur', 'directrice',
  'animateur', 'animatrice',
  'responsable',
  'superviseur',
  'manager',
  'admin', 'administrator', 'administrateur',
  'root', 'superuser',
  'chef', 'patron', 'boss',
  'pdg', 'ceo', 'coo', 'cto', 'cfo',
  'directeur_general', 'dg',
  'president', 'vice_president',
  'secretaire', 'secretary',
  'assistant', 'assistante',
  'coordinateur', 'coordonnateur',
  'consultant',
  'expert',
  'auditeur',
  'inspecteur',
  'controleur', 'controleuse',
  'formateur', 'formatrice',
  'enseignant', 'professeur',
  'stagiaire', 'intern',
  'apprenti',
  'employe', 'employee',
  'ouvrier',
  'technicien',
  'ingenieur',
  'qualiticien',

  // ---- Termes QHSE / Sécurité / Qualité ----
  'hse',
  'qhse',
  'sst',
  'securite',
  'security',
  'safety',
  'hygiene',
  'qualite',
  'quality',
  'environnement',
  'environment',
  'prevention',
  'preventeur',
  'secouriste',
  'incendie',
  'fire',
  'epi',
  'epc',
  'permis',
  'travail_hauteur',
  'espace_confiné',

  // ---- Normes ISO / Réglementation ----
  'iso', 'iso9001', 'iso14001', 'iso45001', 'iso19011', 'iso27001',
  'iso50001', 'iso22000',
  'ohsas', 'ohsas18001',
  'haccp',
  'iLO', 'oit',
  'norme', 'normes',
  'audit',
  'conformite',
  'reglementation',
  'code_travail', 'code_du_travail',
  'code',

  // ---- Marque / Plateforme (à réserver pour la marque HSE Academy / IICP) ----
  'iicp', 'hseacademy', 'hse_academy', 'academy',
  'institut', 'institute',
  'institutqhse', 'iicp_qhse',
  'contact', 'support', 'help', 'aide',
  'info', 'information', 'informations',
  'webmaster', 'dev', 'developer', 'developpeur',
  'system', 'sysadmin',
  'test', 'test_user', 'demo', 'example', 'sample',
  'user', 'users', 'account', 'accounts',
  'profile', 'profiles',
  'public', 'private',
  'official', 'officiel',
  'team', 'equipe',
  'staff', 'personnel',
  'social', 'media',
  'blog', 'blogs',
  'news', 'actualites',
  'forum', 'forums',
  'helpdesk', 'service',
  'noreply', 'no-reply',
  'mail', 'email',
  'phone', 'tel',
  'whatsapp', 'telegram',
  'facebook', 'twitter', 'instagram', 'linkedin', 'tiktok',
  'youtube', 'google', 'apple', 'microsoft',

  // ---- Mots génériques / impersonnels ----
  'anonymous', 'anonyme',
  'default',
  'new', 'nouveau',
  'guest', 'invite',
  'member', 'membre',
  'all', 'tous',
  'me', 'moi',
  'you', 'toi',
  'we', 'nous',
];

// Vérifie si un username est réservé (case-insensitive)
export function isReservedUsername(username: string): boolean {
  const lower = username.toLowerCase();
  // Vérifier la liste explicite
  if (RESERVED_USERNAMES.includes(lower)) return true;
  // Vérifier les préfixes (ex: "admin_xxx", "support_xxx")
  const reservedPrefixes = ['admin', 'root', 'support', 'help', 'contact', 'info', 'iicp', 'hseacademy', 'official', 'test'];
  if (reservedPrefixes.some(p => lower.startsWith(p + '_') || lower === p)) return true;
  return false;
}

// Vérifie si un username est valide (format + non réservé)
// Retourne { valid: boolean, error?: string }
export function validateUsername(username: string, isAdmin: boolean = false): { valid: boolean; error?: string } {
  // Format : 5 à 12 caractères, lettres/chiffres/underscore
  if (!username || !/^[a-zA-Z0-9_]{5,12}$/.test(username)) {
    return { valid: false, error: 'Username invalide. 5 à 12 caractères, lettres, chiffres et _ uniquement.' };
  }
  // Si admin, on bypass la liste des réservés
  if (isAdmin) return { valid: true };
  // Vérifier la liste des réservés
  if (isReservedUsername(username)) {
    return {
      valid: false,
      error: `Le username "${username}" est réservé et ne peut pas être utilisé. Si vous avez besoin de ce nom, veuillez contacter l'administration via le formulaire de contact.`
    };
  }
  return { valid: true };
}
