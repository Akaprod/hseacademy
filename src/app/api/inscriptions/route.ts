// ============================================================================
// POST /api/inscriptions — Soumettre une demande d'inscription (PUBLIC)
// ============================================================================
// Soumis sans auth par un candidat depuis /inscriptions/[formationSlug]
// Rate limiting simple : max 5 demandes / heure par IP (anti-spam)
// Email de confirmation envoyé au candidat + notification à l'admin
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isEmailConfigured, sendInscriptionConfirmationEmail, sendInscriptionAdminNotification } from '@/lib/email';
import { emailSchema } from '@/lib/validation';

// In-memory rate limit (par IP) — simple, suffisant pour anti-spam basique
// Pour production à grande échelle, utiliser Redis. Pour HSE Academy (faible volume), OK.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 heure
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // --- Rate limit par IP ---
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
    // Nettoyage des entrées expirées (1 fois sur 10)
    if (Math.random() < 0.1) {
      for (const [ip, e] of rateLimitMap) {
        if (e.resetAt < now) rateLimitMap.delete(ip);
      }
    }

    // === Validation des champs requis ===
    const {
      formationSlug, formationLevel,
      nom, prenom, genre, birthDate, residence, nationalite,
      email, phone, addressStreet, addressCity, addressPostalCode, addressCountry,
      niveauScolaire, dernierDiplome, experienceHSE,
    } = body || {};

    // Champs obligatoires
    if (!formationSlug || typeof formationSlug !== 'string') {
      return NextResponse.json({ error: 'Formation visée requise' }, { status: 400 });
    }
    if (!formationLevel || typeof formationLevel !== 'string') {
      return NextResponse.json({ error: 'Niveau d\'inscription requis' }, { status: 400 });
    }
    if (!nom || typeof nom !== 'string' || nom.trim().length < 2) {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    }
    if (!prenom || typeof prenom !== 'string' || prenom.trim().length < 2) {
      return NextResponse.json({ error: 'Prénom requis' }, { status: 400 });
    }
    if (!genre || !['M', 'F'].includes(genre)) {
      return NextResponse.json({ error: 'Genre invalide (M ou F)' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }
    const emailCheck = emailSchema.safeParse(email.toLowerCase().trim());
    if (!emailCheck.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Vérifier que la formation existe et est diplomante
    const formation = await db.formation.findUnique({ where: { slug: formationSlug } });
    if (!formation) {
      return NextResponse.json({ error: 'Formation introuvable' }, { status: 404 });
    }
    if (formation.type !== 'diplomante') {
      return NextResponse.json({ error: 'Cette formation n\'accepte pas les inscriptions en ligne' }, { status: 400 });
    }
    if (formation.archived) {
      return NextResponse.json({ error: 'Cette formation n\'est plus disponible' }, { status: 400 });
    }

    // === Anti-doublon : même email + même formation dans les 30 derniers jours ===
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const existing = await db.inscriptionRequest.findFirst({
      where: {
        email: emailCheck.data,
        formationSlug,
        createdAt: { gt: thirtyDaysAgo },
        status: { not: 'rejected' },
      },
    });
    if (existing) {
      return NextResponse.json({
        error: 'Vous avez déjà soumis une demande pour cette formation récemment. Notre équipe vous contactera.',
      }, { status: 409 });
    }

    // === Créer la demande ===
    const inscription = await db.inscriptionRequest.create({
      data: {
        formationSlug,
        formationLevel,
        nom: nom.trim(),
        prenom: prenom.trim(),
        genre,
        birthDate: birthDate ? new Date(birthDate) : null,
        residence: residence?.trim() || null,
        nationalite: nationalite?.trim() || null,
        email: emailCheck.data,
        phone: phone?.trim() || null,
        addressStreet: addressStreet?.trim() || null,
        addressCity: addressCity?.trim() || null,
        addressPostalCode: addressPostalCode?.trim() || null,
        addressCountry: addressCountry?.trim() || null,
        niveauScolaire: niveauScolaire || null,
        dernierDiplome: dernierDiplome?.trim() || null,
        experienceHSE: experienceHSE || null,
        ipAddress: clientIP,
        userAgent: req.headers.get('user-agent') || null,
      },
    });

    // === Emails (best-effort — ne pas échouer si SMTP down) ===
    if (isEmailConfigured()) {
      try {
        await sendInscriptionConfirmationEmail(inscription.email, {
          prenom: inscription.prenom,
          nom: inscription.nom,
          formationTitle: formation.title,
          formationLevel: inscription.formationLevel,
          inscriptionId: inscription.id,
        });
      } catch (err) {
        console.error('sendInscriptionConfirmationEmail failed:', err);
      }
      try {
        // Notification à l'admin (adresse root admin du .env)
        const adminEmail = process.env.ROOT_ADMIN_EMAIL || 'admin@hseacademy.online';
        await sendInscriptionAdminNotification(adminEmail, {
          prenom: inscription.prenom,
          nom: inscription.nom,
          email: inscription.email,
          phone: inscription.phone,
          formationTitle: formation.title,
          formationLevel: inscription.formationLevel,
          inscriptionId: inscription.id,
        });
      } catch (err) {
        console.error('sendInscriptionAdminNotification failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Votre demande d\'inscription a été enregistrée avec succès. Notre équipe vous contactera dans les plus brefs délais.',
      inscriptionId: inscription.id,
    });
  } catch (error) {
    console.error('POST /api/inscriptions error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
