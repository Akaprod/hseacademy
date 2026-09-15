import { z } from 'zod';
import { parsePhoneNumber } from 'libphonenumber-js';

// ============================================================================
// Validation — schémas zod + helpers téléphone
// ============================================================================

export const passwordSchema = z.string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[@#;!$%^&*()_+\-=\[\]{}|,.?~]/, 'Le mot de passe doit contenir au moins un caractère spécial (@ # ; ! ...)');

export const emailSchema = z.string().email('Email invalide');

// --- Téléphone : normalisation E.164 ---
// Le frontend envoie { phone: "+2126XXXXXXXX", country: "MA" }
// On valide via libphonenumber-js et on normalise en E.164.

export interface PhoneValidationResult {
  valid: boolean;
  normalized?: string;
  country?: string;
  error?: string;
}

export function validateAndNormalizePhone(phone: string, country?: string): PhoneValidationResult {
  if (!phone || phone.trim() === '') {
    return { valid: true, normalized: null }; // Phone is optional
  }
  try {
    const parsed = parsePhoneNumber(phone, (country as any) || undefined);
    if (!parsed || !parsed.isValid()) {
      return { valid: false, error: 'Numéro de téléphone invalide' };
    }
    return {
      valid: true,
      normalized: parsed.format('E.164'), // +2126XXXXXXXX
      country: parsed.country || country || null,
    };
  } catch {
    return { valid: false, error: 'Numéro de téléphone invalide' };
  }
}

// --- Validation nom complet ---
export const fullNameSchema = z.string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(100, 'Le nom ne peut pas dépasser 100 caractères')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne doit contenir que des lettres, espaces, apostrophes ou tirets');

// --- Similarité entre deux chaînes (Levenshtein normalisé) ---
export function nameSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshtein(s1, s2);
  return 1 - dist / maxLen;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

// Compare prénom et nom séparément
export function compareNames(oldName: string, newName: string): {
  similarity: number;
  isMinorCorrection: boolean;
  isSubstantial: boolean;
} {
  const oldParts = oldName.trim().split(/\s+/);
  const newParts = newName.trim().split(/\s+/);
  if (oldParts.length !== newParts.length) {
    return { similarity: 0, isMinorCorrection: false, isSubstantial: true };
  }
  const sims = oldParts.map((old, i) => nameSimilarity(old, newParts[i] || ''));
  const avg = sims.reduce((a, b) => a + b, 0) / sims.length;
  return {
    similarity: avg,
    isMinorCorrection: avg >= 0.8 && avg < 1.0,
    isSubstantial: avg < 0.8,
  };
}
