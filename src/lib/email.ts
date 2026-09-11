import nodemailer from 'nodemailer';
import { createHmac, randomBytes } from 'node:crypto';

// ============================================================================
// Email — transporter nodemailer + templates
// ============================================================================
// Le transporter est créé à la demande. Si SMTP_HOST n'est pas configuré,
// les envois échouent proprement (graceful degradation) sans crasher l'app.

let transporter: nodemailer.Transporter | null = null;
let transporterInitFailed = false;

function getTransporter(): nodemailer.Transporter | null {
  // Si déjà créé avec succès, le réutiliser
  if (transporter) return transporter;
  // Ne pas retenter si les variables d'env n'existent pas (mais re-tenter si elles arrivent)
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    return null; // SMTP non configuré
  }
  // Créer le transporter (même si un échec précédent avait eu lieu)
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

const FROM = process.env.SMTP_FROM || 'HSE Academy <mail@hseacademy.online>';
const SITE_URL = 'https://hseacademy.online';

export function isEmailConfigured(): boolean {
  return getTransporter() !== null;
}

// --- Génération de token de vérification (lien) ---
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET manquant');
  return createHmac('sha256', secret).update(token).digest('hex');
}

// --- Génération de code à 6 chiffres ---
export function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashCode(code: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET manquant');
  return createHmac('sha256', secret).update(code).digest('hex');
}

// --- Envoi email de vérification (LIEN UNIQUEMENT) ---
// Note: la vérification par code à 6 chiffres est temporairement désactivée
// (le route /api/auth/verify-code n'était pas déployé correctement sur Hostinger).
// On reviendra à la vérification par code plus tard.
export async function sendVerificationEmail(
  to: string,
  token: string,
  code?: string
): Promise<{ success: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) {
    return { success: false, error: 'Service email non configuré' };
  }
  const verifyUrl = `${SITE_URL}/api/auth/verify-email?token=${token}`;

  try {
    await t.sendMail({
      from: FROM,
      to,
      subject: 'Vérifiez votre adresse email — HSE Academy',
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #059669; font-size: 24px;">HSE Academy</h1>
            <p style="color: #64748b; font-size: 14px;">Institut International des Compétences Professionnelles QHSE</p>
          </div>
          <h2 style="color: #0f172a; font-size: 20px;">Vérifiez votre adresse email</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Vous venez de créer un compte sur HSE Academy. Pour activer votre compte
            et accéder à toutes les fonctionnalités, veuillez vérifier votre adresse email
            en cliquant sur le bouton ci-dessous.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}"
               style="display: inline-block; background: #059669; color: white; padding: 14px 36px;
                      border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
              Vérifier mon email
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px;">
            Si le bouton ne fonctionne pas, copiez-collez le lien suivant dans votre navigateur :
          </p>
          <p style="background: #f1f5f9; border-radius: 6px; padding: 10px 12px; word-break: break-all;
                    color: #0369a1; font-size: 12px; font-family: monospace;">
            ${verifyUrl}
          </p>
          <p style="color: #64748b; font-size: 13px; margin-top: 16px;">
            Si vous ne trouvez pas cet email, vérifiez votre dossier Spam / Courriers indésirables.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            Si vous n'avez pas créé de compte sur HSE Academy, vous pouvez ignorer cet email.
            Ce lien expire dans 24 heures.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error('SMTP sendMail error:', err);
    return { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
  }
}
