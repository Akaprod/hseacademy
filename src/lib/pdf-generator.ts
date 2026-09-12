import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { buildVerifyUrl } from '@/lib/verify-url';

// ============================================================================
// AT-P3 : Génération PDF officielle d'attestation (server-side)
// ============================================================================
//
// Lib : pdfkit (pur JS, pas de Chromium) + qrcode (server-side PNG).
//
// Format : A4 portrait (595.28 x 841.89 pt, soit 210 x 297 mm)
// Source de vérité : CourseAttestation + DB. Aucune donnée client trustée.
//
// Sécurité :
//   - Le PDF n'est généré qu'à partir de données venant de la DB
//   - Le QR contient UNIQUEMENT l'URL publique de vérification
//   - signatureHash, AUTH_SECRET, userId, courseId, enrollmentId ne sont
//     JAMAIS imprimés
//   - Le statut (VALIDE/RÉVOQUÉE) est imprimé et reflète la DB
// ============================================================================

export interface AttestationPdfData {
  attestationNo: string;
  serialNumber: string;
  fullName: string;
  courseName: string;
  overallScore: number;
  issuedDate: Date;
  status: string;        // 'valid' | 'revoked' | ...
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hseacademy.online';

// A4 portrait en points (1pt = 1/72 inch, A4 = 595.28 x 841.89 pt)
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56; // ~19.7 mm

// Palette HSE Academy (cohérente avec le reste du projet)
const COLOR_EMERALD_DARK = '#065f46';   // emerald-800
const COLOR_EMERALD = '#059669';        // emerald-600
const COLOR_EMERALD_LIGHT = '#d1fae5'; // emerald-100
const COLOR_SLATE_DARK = '#0f172a';    // slate-900
const COLOR_SLATE = '#334155';         // slate-700
const COLOR_SLATE_LIGHT = '#64748b';    // slate-500
const COLOR_AMBER = '#d97706';         // amber-600
const COLOR_RED = '#dc2626';           // red-600
const COLOR_BG_WARM = '#fafaf9';       // stone-50

function formatDateFR(iso: Date): string {
  try {
    return iso.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return String(iso);
  }
}

/**
 * Génère le PDF officiel d'attestation et retourne un Buffer.
 * Ne stocke rien sur disque — génération à la volée.
 */
export async function generateAttestationPdf(data: AttestationPdfData): Promise<Buffer> {
  // --- Pré-charger le logo SVG ---
  const logoPath = path.join(process.cwd(), 'public', 'logo.svg');
  let logoBuffer: Buffer | null = null;
  try {
    logoBuffer = await fs.readFile(logoPath);
  } catch {
    // Logo absent — on génère un placeholder vectoriel directement dans le PDF
    logoBuffer = null;
  }

  // --- Générer le QR code PNG (server-side, via qrcode) ---
  const verifyUrl = buildVerifyUrl(data.serialNumber);
  const qrPngBuffer = await QRCode.toBuffer(verifyUrl, {
    type: 'png',
    margin: 1,
    width: 240,
    color: {
      dark: COLOR_EMERALD_DARK,
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });

  // --- Créer le document PDF ---
  // pdfkit supports custom page size as [width, height]
  // IMPORTANT : layoutBuffer = false empêche pdfkit d'ajouter une page blanche
  // en fin de document. Le PDF fait EXACTEMENT 1 page A4.
  const doc = new PDFDocument({
    size: [PAGE_W, PAGE_H],
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    bufferPages: false,
    info: {
      Title: `Attestation ${data.serialNumber}`,
      Author: 'HSE Academy',
      Subject: 'Attestation de formation',
      Producer: 'HSE Academy',
      Creator: 'HSE Academy',
    },
  });

  // Buffer accumulé
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));

  const finished = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  // ========================================================================
  // DESSIN DU PDF
  // ========================================================================

  // --- Fond chaud subtil ---
  doc.rect(0, 0, PAGE_W, PAGE_H).fillColor(COLOR_BG_WARM).fill();

  // --- Bandeau supérieur emerald ---
  doc.rect(0, 0, PAGE_W, 8).fillColor(COLOR_EMERALD).fill();
  doc.rect(0, PAGE_H - 8, PAGE_W, 8).fillColor(COLOR_EMERALD).fill();

  // --- Bordure décorative ---
  doc
    .rect(MARGIN - 18, MARGIN - 18, PAGE_W - 2 * (MARGIN - 18), PAGE_H - 2 * (MARGIN - 18))
    .lineWidth(1.5)
    .strokeColor(COLOR_EMERALD)
    .dash([2, 3], { phase: 0 })
    .stroke()
    .undash();

  // --- Watermark discret HSE Academy (très léger) ---
  // IMPORTANT : lineBreak: false + width large enough pour éviter
  // que pdfkit n'ajoute une page blanche supplémentaire.
  doc.save();
  doc.translate(PAGE_W / 2, PAGE_H / 2);
  doc.rotate(-45);
  doc
    .fillColor(COLOR_EMERALD)
    .opacity(0.04)
    .fontSize(60)
    .font('Helvetica-Bold')
    .text('HSE ACADEMY', 0, 0, { align: 'center', width: 400, lineBreak: false });
  doc.opacity(1);
  doc.restore();

  // --- HEADER ---
  let y = MARGIN + 24;

  // Logo
  const logoSize = 56;
  const logoX = (PAGE_W - logoSize) / 2;
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, logoX, y, { width: logoSize, height: logoSize });
    } catch {
      // SVG peut échouer à être rendu par pdfkit ; on dessine un fallback
      drawLogoFallback(doc, logoX, y, logoSize);
    }
  } else {
    drawLogoFallback(doc, logoX, y, logoSize);
  }

  y += logoSize + 12;

  // Titre institutionnel
  doc
    .fillColor(COLOR_EMERALD_DARK)
    .font('Helvetica-Bold')
    .fontSize(18)
    .text('HSE Academy', PAGE_W / 2, y, { align: 'center' });

  y += 22;

  doc
    .fillColor(COLOR_SLATE_LIGHT)
    .font('Helvetica')
    .fontSize(8.5)
    .text('INSTITUT INTERNATIONAL DES COMPÉTENCES PROFESSIONNELLES QHSE', PAGE_W / 2, y, {
      align: 'center',
      characterSpacing: 1.5,
    });

  y += 14;

  // Ligne séparatrice emerald
  doc
    .moveTo(MARGIN + 80, y)
    .lineTo(PAGE_W - MARGIN - 80, y)
    .lineWidth(0.8)
    .strokeColor(COLOR_EMERALD)
    .stroke();

  y += 32;

  // --- TITRE ATTESTATION ---
  doc
    .fillColor(COLOR_EMERALD_DARK)
    .font('Helvetica-Bold')
    .fontSize(24)
    .text('ATTESTATION', PAGE_W / 2, y, { align: 'center', characterSpacing: 4 });

  y += 26;

  doc
    .fillColor(COLOR_SLATE)
    .font('Helvetica')
    .fontSize(11)
    .text('DE FORMATION', PAGE_W / 2, y, { align: 'center', characterSpacing: 3 });

  y += 36;

  // --- TEXTE INSTITUTIONNEL ---
  doc
    .fillColor(COLOR_SLATE)
    .font('Helvetica-Oblique')
    .fontSize(10.5)
    .text(
      'L\'Institut International des Compétences Professionnelles QHSE certifie que',
      MARGIN + 30,
      y,
      { align: 'center', width: PAGE_W - 2 * (MARGIN + 30) }
    );

  y += 28;

  // --- BÉNÉFICIAIRE (valeur depuis DB) ---
  doc
    .fillColor(COLOR_SLATE_LIGHT)
    .font('Helvetica')
    .fontSize(8)
    .text('BÉNÉFICIAIRE', PAGE_W / 2, y, { align: 'center', characterSpacing: 2 });

  y += 14;

  doc
    .fillColor(COLOR_SLATE_DARK)
    .font('Helvetica-Bold')
    .fontSize(22)
    .text(data.fullName, PAGE_W / 2, y, { align: 'center' });

  y += 32;

  // --- FORMATION ---
  doc
    .fillColor(COLOR_SLATE_LIGHT)
    .font('Helvetica')
    .fontSize(8)
    .text('A SUIVI AVEC SUCCÈS LA FORMATION', PAGE_W / 2, y, {
      align: 'center',
      characterSpacing: 2,
    });

  y += 14;

  doc
    .fillColor(COLOR_EMERALD_DARK)
    .font('Helvetica-Bold')
    .fontSize(15)
    .text(data.courseName, PAGE_W / 2, y, { align: 'center' });

  y += 30;

  // --- RÉSULTAT + DATE (2 colonnes) ---
  const colW = (PAGE_W - 2 * MARGIN - 60) / 2;
  const leftX = MARGIN + 30;
  const rightX = MARGIN + 30 + colW + 30;

  // Score (depuis DB)
  doc
    .fillColor(COLOR_SLATE_LIGHT)
    .font('Helvetica')
    .fontSize(8)
    .text('SCORE OBTENU', leftX, y, { align: 'center', width: colW, characterSpacing: 2 });

  // Date (depuis DB)
  doc
    .fillColor(COLOR_SLATE_LIGHT)
    .font('Helvetica')
    .fontSize(8)
    .text('DATE D\'ÉMISSION', rightX, y, { align: 'center', width: colW, characterSpacing: 2 });

  y += 14;

  doc
    .fillColor(COLOR_EMERALD_DARK)
    .font('Helvetica-Bold')
    .fontSize(20)
    .text(`${data.overallScore}%`, leftX, y, { align: 'center', width: colW });

  doc
    .fillColor(COLOR_SLATE_DARK)
    .font('Helvetica-Bold')
    .fontSize(13)
    .text(formatDateFR(data.issuedDate), rightX, y, { align: 'center', width: colW });

  y += 28;

  // --- STATUT (couleur selon status DB) ---
  const isRevoked = data.status === 'revoked';
  const statusLabel = isRevoked ? 'RÉVOQUÉE' : 'VALIDE';
  const statusColor = isRevoked ? COLOR_RED : COLOR_EMERALD;

  // Encadré statut
  const statusBoxW = 180;
  const statusBoxH = 26;
  const statusX = (PAGE_W - statusBoxW) / 2;
  const statusY = y;

  doc
    .roundedRect(statusX, statusY, statusBoxW, statusBoxH, 4)
    .fillColor(isRevoked ? '#fef2f2' : COLOR_EMERALD_LIGHT)
    .fill()
    .lineWidth(1)
    .strokeColor(statusColor)
    .stroke();

  doc
    .fillColor(statusColor)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text(`STATUT : ${statusLabel}`, statusX, statusY + 8, {
      align: 'center',
      width: statusBoxW,
      characterSpacing: 2,
    });

  y += statusBoxH + 30;

  // --- IDENTIFICATION (attestationNo + serialNumber) ---
  const identY = y;
  doc
    .fillColor(COLOR_SLATE_LIGHT)
    .font('Helvetica')
    .fontSize(8)
    .text('N° ATTESTATION', leftX, identY, { align: 'center', width: colW, characterSpacing: 2 })
    .text('N° DE SÉRIE', rightX, identY, { align: 'center', width: colW, characterSpacing: 2 });

  doc
    .fillColor(COLOR_SLATE_DARK)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(data.attestationNo, leftX, identY + 13, { align: 'center', width: colW })
    .fillColor(COLOR_EMERALD_DARK)
    .text(data.serialNumber, rightX, identY + 13, { align: 'center', width: colW });

  y += 32;

  // --- QR CODE + VÉRIFICATION ---
  const qrSize = 95;
  const qrX = (PAGE_W - qrSize) / 2;
  // Cadre blanc autour du QR
  doc
    .rect(qrX - 8, y - 8, qrSize + 16, qrSize + 16)
    .fillColor('#ffffff')
    .lineWidth(1)
    .strokeColor(COLOR_EMERALD)
    .fillAndStroke();

  doc.image(qrPngBuffer, qrX, y, { width: qrSize, height: qrSize });

  y += qrSize + 14;

  doc
    .fillColor(COLOR_EMERALD_DARK)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('VÉRIFICATION OFFICIELLE EN LIGNE', PAGE_W / 2, y, {
      align: 'center',
      characterSpacing: 1.5,
    });

  y += 12;

  doc
    .fillColor(COLOR_SLATE)
    .font('Helvetica')
    .fontSize(8.5)
    .text(verifyUrl, PAGE_W / 2, y, { align: 'center' });

  // --- SIGNATURES (zone en bas, position fixe) ---
  // Must be above footerY (which is now PAGE_H - MARGIN - 50 = 735.89)
  // sigY + 18 (text height) must be < footerY - 10 (spacing)
  // sigY < 735.89 - 10 - 18 = 707.89
  // PAGE_H - MARGIN - 100 = 685.89 — safe
  const sigY = PAGE_H - MARGIN - 100;
  const sigColW = (PAGE_W - 2 * MARGIN - 60) / 2;

  // Ligne + label "La Direction"
  doc
    .moveTo(leftX, sigY)
    .lineTo(leftX + sigColW, sigY)
    .lineWidth(0.8)
    .strokeColor(COLOR_SLATE_DARK)
    .stroke();

  doc
    .moveTo(rightX, sigY)
    .lineTo(rightX + sigColW, sigY)
    .lineWidth(0.8)
    .strokeColor(COLOR_SLATE_DARK)
    .stroke();

  doc
    .fillColor(COLOR_SLATE_DARK)
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .text('La Direction', leftX, sigY + 5, { align: 'center', width: sigColW })
    .text('Responsable Pédagogique', rightX, sigY + 5, { align: 'center', width: sigColW });

  doc
    .fillColor(COLOR_SLATE_LIGHT)
    .font('Helvetica-Oblique')
    .fontSize(7.5)
    .text('HSE Academy — Institut QHSE', leftX, sigY + 18, { align: 'center', width: sigColW })
    .text('HSE Academy — Institut QHSE', rightX, sigY + 18, { align: 'center', width: sigColW });

  // --- FOOTER ---
  // IMPORTANT : pdfkit adds a new page when text is placed beyond
  // the bottom margin. We keep ALL footer text well within bounds.
  // Use a single text call with line break to avoid multi-page issues.
  const footerY = PAGE_H - MARGIN - 40;
  doc
    .moveTo(MARGIN + 30, footerY)
    .lineTo(PAGE_W - MARGIN - 30, footerY)
    .lineWidth(0.5)
    .strokeColor(COLOR_EMERALD)
    .stroke();

  // Single text block for footer (avoids pdfkit auto-page-break)
  doc
    .fillColor(COLOR_SLATE_LIGHT)
    .font('Helvetica')
    .fontSize(7)
    .text(
      `HSE Academy — Institut International des Compétences Professionnelles QHSE\nDocument officiel — N° ${data.serialNumber} — Vérifiable sur hseacademy.online/verify/${data.serialNumber}`,
      MARGIN,
      footerY + 6,
      { align: 'center', width: PAGE_W - 2 * MARGIN, lineBreak: true }
    );

  // --- Mention si révoquée ---
  if (isRevoked) {
    doc
      .save()
      .translate(PAGE_W / 2, PAGE_H / 2)
      .rotate(-30)
      .lineWidth(3)
      .strokeColor(COLOR_RED)
      .moveTo(-160, 0)
      .lineTo(160, 0)
      .stroke()
      .restore();

    doc
      .fillColor(COLOR_RED)
      .opacity(0.8)
      .font('Helvetica-Bold')
      .fontSize(48)
      .text('RÉVOQUÉE', PAGE_W / 2, PAGE_H / 2 - 30, { align: 'center', characterSpacing: 8 });
    doc.opacity(1);
  }

  // --- Finaliser ---
  doc.end();

  return finished;
}

// ============================================================================
// Fallback logo : si le SVG ne peut être embeddé, dessiner un cercle emerald
// avec initiales "HSE" au centre.
// ============================================================================
function drawLogoFallback(doc: PDFKit.PDFDocument, x: number, y: number, size: number) {
  doc
    .circle(x + size / 2, y + size / 2, size / 2)
    .fillColor(COLOR_EMERALD)
    .fill();

  doc
    .fillColor('#ffffff')
    .font('Helvetica-Bold')
    .fontSize(16)
    .text('HSE', x, y + size / 2 - 8, { align: 'center', width: size });
}
