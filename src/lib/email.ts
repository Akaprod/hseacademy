import nodemailer from 'nodemailer';
import { createHmac, randomBytes } from 'node:crypto';

// ============================================================================
// Email — transporter nodemailer + templates
// ============================================================================
// Le transporter est créé à la demande. Si SMTP_HOST n'est pas configuré,
// les envois échouent proprement (graceful degradation) sans crasher l'app.

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    return null; // SMTP non configuré — les emails ne seront pas envoyés
  }
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

const FROM = process.env.SMTP_FROM || 'HSE Academy <noreply@hseacademy.online>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hseacademy.online';

export function isEmailConfigured(): boolean {
  return getTransporter() !== null;
}

// --- Génération de token de vérification ---
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET manquant');
  return createHmac('sha256', secret).update(token).digest('hex');
}

// --- Envoi email de vérification ---
export async function sendVerificationEmail(
  to: string,
  token: string
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
               style="display: inline-block; background: #059669; color: white; padding: 12px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Vérifier mon email
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px;">
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
    return { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
  }
}
