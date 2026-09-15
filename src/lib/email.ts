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

// ============================================================================
// PASSWORD RESET — Email de réinitialisation + alerte sécurité
// ============================================================================

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) {
    return { success: false, error: 'Service email non configuré' };
  }
  const resetUrl = `${SITE_URL}/reset-password?token=${token}`;

  try {
    await t.sendMail({
      from: FROM,
      to,
      subject: 'Réinitialisez votre mot de passe — HSE Academy',
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #059669; font-size: 24px;">HSE Academy</h1>
            <p style="color: #64748b; font-size: 14px;">Institut International des Compétences Professionnelles QHSE</p>
          </div>
          <h2 style="color: #0f172a; font-size: 20px;">Réinitialisez votre mot de passe</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Vous avez demandé la réinitialisation de votre mot de passe sur HSE Academy.
            Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; background: #059669; color: white; padding: 14px 36px;
                      border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px;">
            Si le bouton ne fonctionne pas, copiez-collez le lien suivant dans votre navigateur :
          </p>
          <p style="background: #f1f5f9; border-radius: 6px; padding: 10px 12px; word-break: break-all;
                    color: #0369a1; font-size: 12px; font-family: monospace;">
            ${resetUrl}
          </p>
          <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
            <p style="color: #92400e; font-size: 13px; margin: 0;">
              <strong>⚠️ Ce lien expire dans 10 minutes.</strong>
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
            Votre mot de passe reste inchangé.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error('SMTP sendMail error (password reset):', err);
    return { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
  }
}

export async function sendSecurityAlertEmail(
  to: string,
  alertType: 'failed_logins' | 'reset_attempts',
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) {
    return { success: false, error: 'Service email non configuré' };
  }

  const subject = alertType === 'failed_logins'
    ? 'Alerte sécurité — Tentatives de connexion — HSE Academy'
    : 'Alerte sécurité — Demandes de réinitialisation — HSE Academy';

  const message = alertType === 'failed_logins'
    ? 'Plusieurs tentatives de connexion avec un mot de passe incorrect ont été détectées sur votre compte. Par mesure de sécurité, votre compte a été gelé pendant 4 heures.'
    : 'Plusieurs demandes de réinitialisation de mot de passe ont été effectuées pour votre compte. Par mesure de sécurité, les authentifications ont été bloquées pendant 24 heures.';

  const recommendation = alertType === 'failed_logins'
    ? 'Si vous êtes à l\'origine de ces tentatives, attendez 4 heures avant de réessayer. Si ce n\'était pas vous, nous vous recommandons de changer votre mot de passe et de contacter l\'administration.'
    : 'Si vous êtes à l\'origine de ces demandes, attendez 24 heures avant de réessayer. Si ce n\'était pas vous, contactez immédiatement l\'administration.';

  try {
    await t.sendMail({
      from: FROM,
      to,
      subject,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #059669; font-size: 24px;">HSE Academy</h1>
          </div>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="color: #991b1b; font-size: 18px; margin: 0 0 8px 0;">⚠️ Alerte de sécurité</h2>
            <p style="color: #7f1d1d; font-size: 14px; margin: 0;">${message}</p>
          </div>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">${recommendation}</p>
          ${ipAddress ? `<p style="color: #64748b; font-size: 13px;">Adresse IP détectée : ${ipAddress}</p>` : ''}
          <p style="color: #64748b; font-size: 13px; margin-top: 16px;">
            Si ce n'était pas vous, contactez-nous à contact@institutqhse.com.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error('SMTP sendMail error (security alert):', err);
    return { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
  }
}

// ============================================================================
// SECURITY CHANGE — Code OTP pour modification email/tel/password
// ============================================================================
// Envoie un code à 6 chiffres par email pour valider une modification sensible.
// Le code est valable 10 minutes. L'utilisateur doit le saisir pour confirmer.
// ============================================================================

export async function sendSecurityChangeCodeEmail(
  to: string,
  code: string,
  changeType: 'email' | 'phone' | 'password',
  preview?: string
): Promise<{ success: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) {
    return { success: false, error: 'Service email non configuré' };
  }

  const labels: Record<typeof changeType, string> = {
    email: 'votre adresse email',
    phone: 'votre numéro de téléphone',
    password: 'votre mot de passe',
  };

  const subject = `Code de confirmation — Modification de votre compte — HSE Academy`;

  const previewLine = preview
    ? `<p style="color: #475569; font-size: 14px; margin: 0 0 16px 0; background: #f1f5f9; padding: 12px; border-radius: 6px;">Nouvelle valeur : <strong>${preview}</strong></p>`
    : '';

  try {
    await t.sendMail({
      from: FROM,
      to,
      subject,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #059669; font-size: 24px;">HSE Academy</h1>
            <p style="color: #64748b; font-size: 14px;">Institut International des Compétences Professionnelles QHSE</p>
          </div>
          <h2 style="color: #0f172a; font-size: 20px;">Code de confirmation</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Vous avez demandé la modification de ${labels[changeType]} sur votre compte HSE Academy.
            Pour valider cette modification, veuillez saisir le code ci-dessous :
          </p>
          ${previewLine}
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background: #059669; color: white; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px;">${code}</div>
          </div>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; text-align: center;">
            Ce code est valable <strong>10 minutes</strong>. Ne le partagez avec personne.
          </p>
          <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-top: 20px;">
            <p style="color: #92400e; font-size: 13px; margin: 0;">
              Si vous n'avez pas demandé cette modification, ignorez cet email. Votre compte reste inchangé.
            </p>
          </div>
          <p style="color: #64748b; font-size: 13px; margin-top: 16px; text-align: center;">
            HSE Academy — Sécurité du compte
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error('SMTP sendMail error (security change code):', err);
    return { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
  }
}

// ============================================================================
// INSCRIPTION — Confirmation au candidat + notification admin
// ============================================================================

export async function sendInscriptionConfirmationEmail(
  to: string,
  data: {
    prenom: string;
    nom: string;
    formationTitle: string;
    formationLevel: string;
    inscriptionId: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) {
    return { success: false, error: 'Service email non configuré' };
  }

  try {
    await t.sendMail({
      from: FROM,
      to,
      subject: 'Confirmation de votre demande d\'inscription — HSE Academy',
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #059669; font-size: 24px;">HSE Academy</h1>
            <p style="color: #64748b; font-size: 14px;">Institut International des Compétences Professionnelles QHSE</p>
          </div>
          <h2 style="color: #0f172a; font-size: 20px;">Demande d'inscription reçue</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Bonjour <strong>${data.prenom} ${data.nom}</strong>,
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Nous avons bien reçu votre demande d'inscription pour la formation suivante :
          </p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #065f46;">${data.formationTitle}</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #047857;">Niveau : ${data.formationLevel}</p>
          </div>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Notre équipe d'admission va examiner votre demande et vous contactera dans les plus brefs délais
            pour finaliser votre inscription et vous fournir toutes les informations nécessaires
            (documents requis, frais, rentrée, etc.).
          </p>
          <p style="color: #64748b; font-size: 13px; margin-top: 20px;">
            Référence : <strong>${data.inscriptionId}</strong><br>
            Si vous n'avez pas soumis cette demande, ignorez cet email.
          </p>
          <p style="color: #64748b; font-size: 13px; margin-top: 16px;">
            HSE Academy — <a href="${SITE_URL}" style="color: #059669;">${SITE_URL}</a>
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error('SMTP sendMail error (inscription confirmation):', err);
    return { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
  }
}

export async function sendInscriptionAdminNotification(
  to: string,
  data: {
    prenom: string;
    nom: string;
    email: string;
    phone: string | null;
    formationTitle: string;
    formationLevel: string;
    inscriptionId: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) {
    return { success: false, error: 'Service email non configuré' };
  }

  try {
    await t.sendMail({
      from: FROM,
      to,
      subject: `Nouvelle demande d'inscription — ${data.prenom} ${data.nom} — ${data.formationTitle}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="color: #92400e; font-size: 18px; margin: 0 0 8px 0;">🔔 Nouvelle demande d'inscription</h2>
            <p style="color: #78350f; font-size: 14px; margin: 0;">À traiter depuis le dashboard admin → Inscriptions</p>
          </div>
          <h3 style="color: #0f172a; font-size: 16px;">Candidat</h3>
          <p style="color: #334155; font-size: 15px;">
            <strong>${data.prenom} ${data.nom}</strong><br>
            Email : <a href="mailto:${data.email}" style="color: #059669;">${data.email}</a><br>
            ${data.phone ? `Téléphone : ${data.phone}<br>` : ''}
          </p>
          <h3 style="color: #0f172a; font-size: 16px;">Formation</h3>
          <p style="color: #334155; font-size: 15px;">
            <strong>${data.formationTitle}</strong><br>
            Niveau : ${data.formationLevel}
          </p>
          <p style="color: #64748b; font-size: 13px; margin-top: 16px;">
            Référence : <strong>${data.inscriptionId}</strong><br>
            <a href="${SITE_URL}/?admin=inscriptions" style="color: #059669;">Voir dans le dashboard admin</a>
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error('SMTP sendMail error (inscription admin notification):', err);
    return { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
  }
}

// ============================================================================
// CERTIFICATION REQUEST — Confirmation au candidat + notification admin
// ============================================================================
// 3 modes : 'individuel' (contact <24h), 'groupe' (liste d'attente), 'entreprise' (contact <24h)
// Le template de confirmation est adapté selon le mode.
// ============================================================================

export async function sendCertificationConfirmationEmail(
  to: string,
  data: {
    prenom: string;
    nom: string;
    mode: 'individuel' | 'groupe' | 'entreprise';
    formationLabel: string;
    modeFormation: string;
    requestId: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) {
    return { success: false, error: 'Service email non configuré' };
  }

  // Messages spécifiques selon le mode
  const messages: Record<typeof data.mode, { subject: string; body: string }> = {
    individuel: {
      subject: 'Demande d\'inscription reçue — HSE Academy',
      body: 'Notre équipe vous contactera dans les <strong>24 heures maximum</strong> pour finaliser votre inscription et organiser votre session de formation.',
    },
    groupe: {
      subject: 'Inscription en liste d\'attente confirmée — HSE Academy',
      body: 'Votre demande a été ajoutée à notre <strong>liste d\'attente</strong>. Dès qu\'un groupe sera constitué pour cette formation, nous vous contacterons pour fixer les détails (date, lieu, mode) et organiser la session ensemble.',
    },
    entreprise: {
      subject: 'Demande de formation entreprise reçue — HSE Academy',
      body: 'Notre équipe commerciale vous contactera dans les <strong>24 heures maximum</strong> pour échanger sur vos besoins spécifiques, le nombre de collaborateurs à former, et les modalités d\'organisation (présentiel, en ligne, sur site).',
    },
  };

  const msg = messages[data.mode];

  const modeFormationLabels: Record<string, string> = {
    presentiel: 'Présentiel',
    ligne: 'En ligne',
    hybride: 'Hybride',
  };

  try {
    await t.sendMail({
      from: FROM,
      to,
      subject: msg.subject,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #059669; font-size: 24px;">HSE Academy</h1>
            <p style="color: #64748b; font-size: 14px;">Institut International des Compétences Professionnelles QHSE</p>
          </div>
          <h2 style="color: #0f172a; font-size: 20px;">Demande d'inscription reçue</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Bonjour <strong>${data.prenom} ${data.nom}</strong>,
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Nous avons bien reçu votre demande d'inscription pour la formation suivante :
          </p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #065f46;">${data.formationLabel}</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #047857;">Mode souhaité : ${modeFormationLabels[data.modeFormation] || data.modeFormation}</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #047857;">Type : ${data.mode === 'individuel' ? 'Individuel' : data.mode === 'groupe' ? 'Groupe' : 'Entreprise'}</p>
          </div>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            ${msg.body}
          </p>
          <p style="color: #64748b; font-size: 13px; margin-top: 20px;">
            Référence : <strong>${data.requestId}</strong><br>
            Si vous n'avez pas soumis cette demande, ignorez cet email.
          </p>
          <p style="color: #64748b; font-size: 13px; margin-top: 16px;">
            HSE Academy — <a href="${SITE_URL}" style="color: #059669;">${SITE_URL}</a>
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error('SMTP sendMail error (certification confirmation):', err);
    return { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
  }
}

export async function sendCertificationAdminNotification(
  to: string,
  data: {
    prenom: string;
    nom: string;
    email: string;
    phone: string | null;
    mode: 'individuel' | 'groupe' | 'entreprise';
    formationLabel: string;
    modeFormation: string;
    entreprise: string | null;
    nbPersonnes: number | null;
    requestId: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) {
    return { success: false, error: 'Service email non configuré' };
  }

  const modeLabels: Record<typeof data.mode, string> = {
    individuel: 'Individuel (contact <24h)',
    groupe: 'Groupe (liste d\'attente)',
    entreprise: 'Entreprise (contact <24h)',
  };
  const modeFormationLabels: Record<string, string> = {
    presentiel: 'Présentiel',
    ligne: 'En ligne',
    hybride: 'Hybride',
  };

  try {
    await t.sendMail({
      from: FROM,
      to,
      subject: `Nouvelle demande ${data.mode} — ${data.prenom} ${data.nom} — ${data.formationLabel}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="color: #92400e; font-size: 18px; margin: 0 0 8px 0;">🔔 Nouvelle demande de formation certifiante</h2>
            <p style="color: #78350f; font-size: 14px; margin: 0;">À traiter depuis le dashboard admin → Inscriptions Certifiantes</p>
          </div>
          <h3 style="color: #0f172a; font-size: 16px;">Candidat</h3>
          <p style="color: #334155; font-size: 15px;">
            <strong>${data.prenom} ${data.nom}</strong><br>
            Email : <a href="mailto:${data.email}" style="color: #059669;">${data.email}</a><br>
            ${data.phone ? `Téléphone : ${data.phone}<br>` : ''}
            ${data.entreprise ? `Entreprise : ${data.entreprise}<br>` : ''}
            ${data.nbPersonnes ? `Nb personnes : ${data.nbPersonnes}<br>` : ''}
          </p>
          <h3 style="color: #0f172a; font-size: 16px;">Formation</h3>
          <p style="color: #334155; font-size: 15px;">
            <strong>${data.formationLabel}</strong><br>
            Type : ${modeLabels[data.mode]}<br>
            Mode souhaité : ${modeFormationLabels[data.modeFormation] || data.modeFormation}
          </p>
          <p style="color: #64748b; font-size: 13px; margin-top: 16px;">
            Référence : <strong>${data.requestId}</strong><br>
            <a href="${SITE_URL}/?admin=certifications" style="color: #059669;">Voir dans le dashboard admin</a>
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error('SMTP sendMail error (certification admin notification):', err);
    return { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
  }
}
