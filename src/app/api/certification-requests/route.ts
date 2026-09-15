// ============================================================================
// POST /api/certification-requests — Soumettre une demande (PUBLIC)
// ============================================================================
// 3 modes : 'individuel' (contact <24h), 'groupe' (liste d'attente), 'entreprise' (contact <24h)
// Body: { mode, formationSlug?, formationOther?, modeFormation, nom, prenom, email, phone?, entreprise?, nbPersonnes? }
// Validation: mode valide, formation (slug OU other requis), modeFormation valide, identité + email
// Anti-doublon : même email + même formation dans les 30 jours
// Rate limit : 5/h/IP
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  isEmailConfigured,
  sendCertificationConfirmationEmail,
  sendCertificationAdminNotification,
} from '@/lib/email';
import { emailSchema } from '@/lib/validation';

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const VALID_MODES = ['individuel', 'groupe', 'entreprise'];
const VALID_MODE_FORMATION = ['presentiel', 'ligne', 'hybride'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // --- Rate limit ---
    const clientIP =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(clientIP);
    if (entry && entry.resetAt > now) {
      if (entry.count >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: 'Trop de demandes. Réessayez dans une heure.' },
          { status: 429 }
        );
      }
      entry.count++;
    } else {
      rateLimitMap.set(clientIP, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    }
    if (Math.random() < 0.1) {
      for (const [ip, e] of rateLimitMap) {
        if (e.resetAt < now) rateLimitMap.delete(ip);
      }
    }

    const {
      mode, formationSlug, formationOther, modeFormation,
      nom, prenom, email, phone, entreprise, nbPersonnes,
    } = body || {};

    // === Validations ===
    if (!mode || !VALID_MODES.includes(mode)) {
      return NextResponse.json({ error: 'Mode d\'inscription invalide' }, { status: 400 });
    }
    if (!modeFormation || !VALID_MODE_FORMATION.includes(modeFormation)) {
      return NextResponse.json({ error: 'Mode de formation invalide' }, { status: 400 });
    }
    if (!formationSlug && !formationOther) {
      return NextResponse.json({ error: 'Veuillez sélectionner une formation ou en saisir une autre' }, { status: 400 });
    }
    if (formationSlug) {
      // Vérifier que la formation existe et est certifiante non archivée
      const formation = await db.formation.findUnique({ where: { slug: formationSlug } });
      if (!formation || formation.type !== 'certifiante' || formation.archived) {
        return NextResponse.json({ error: 'Formation invalide' }, { status: 400 });
      }
    }
    if (!nom || typeof nom !== 'string' || nom.trim().length < 2) {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    }
    if (!prenom || typeof prenom !== 'string' || prenom.trim().length < 2) {
      return NextResponse.json({ error: 'Prénom requis' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }
    const emailCheck = emailSchema.safeParse(email.toLowerCase().trim());
    if (!emailCheck.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Champs spécifiques au mode
    if (mode === 'entreprise' && (!entreprise || typeof entreprise !== 'string' || entreprise.trim().length < 2)) {
      return NextResponse.json({ error: 'Nom de l\'entreprise requis' }, { status: 400 });
    }
    if (mode === 'groupe' && (!nbPersonnes || typeof nbPersonnes !== 'number' || nbPersonnes < 2)) {
      return NextResponse.json({ error: 'Nombre de personnes requis (minimum 2 pour un groupe)' }, { status: 400 });
    }

    // === Anti-doublon : même email + même formation dans les 30 derniers jours ===
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const where: any = {
      email: emailCheck.data,
      createdAt: { gt: thirtyDaysAgo },
      status: { not: 'rejected' },
    };
    if (formationSlug) {
      where.formationSlug = formationSlug;
    } else {
      where.formationOther = formationOther.trim();
    }
    const existing = await db.certificationRequest.findFirst({ where });
    if (existing) {
      return NextResponse.json({
        error: 'Vous avez déjà soumis une demande pour cette formation récemment. Notre équipe vous contactera.',
      }, { status: 409 });
    }

    // === Créer la demande ===
    const request = await db.certificationRequest.create({
      data: {
        mode,
        formationSlug: formationSlug || null,
        formationOther: formationOther?.trim() || null,
        modeFormation,
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: emailCheck.data,
        phone: phone?.trim() || null,
        entreprise: entreprise?.trim() || null,
        nbPersonnes: typeof nbPersonnes === 'number' ? nbPersonnes : null,
        ipAddress: clientIP,
        userAgent: req.headers.get('user-agent') || null,
      },
    });

    // === Emails ===
    let formationLabel = '';
    if (formationSlug) {
      const formation = await db.formation.findUnique({ where: { slug: formationSlug } });
      formationLabel = formation?.title || formationSlug;
    } else {
      formationLabel = formationOther.trim();
    }

    if (isEmailConfigured()) {
      try {
        await sendCertificationConfirmationEmail(request.email, {
          prenom: request.prenom,
          nom: request.nom,
          mode: request.mode as any,
          formationLabel,
          modeFormation: request.modeFormation,
          requestId: request.id,
        });
      } catch (err) {
        console.error('sendCertificationConfirmationEmail failed:', err);
      }
      try {
        const adminEmail = process.env.ROOT_ADMIN_EMAIL || 'admin@institutqhse.com';
        await sendCertificationAdminNotification(adminEmail, {
          prenom: request.prenom,
          nom: request.nom,
          email: request.email,
          phone: request.phone,
          mode: request.mode as any,
          formationLabel,
          modeFormation: request.modeFormation,
          entreprise: request.entreprise,
          nbPersonnes: request.nbPersonnes,
          requestId: request.id,
        });
      } catch (err) {
        console.error('sendCertificationAdminNotification failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Votre demande a été enregistrée avec succès.',
      requestId: request.id,
    });
  } catch (error) {
    console.error('POST /api/certification-requests error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
