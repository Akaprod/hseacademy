// ============================================================================
// Prospect Service — Transmission réelle vers ContactMessage
// ============================================================================
// Le LLM (Lara) est instruit via EDU LARA N°05 d'inclure un marqueur
// structuré [PROSPECT_TRANSMIT]{...}[/PROSPECT_TRANSMIT] dans sa réponse
// quand:
//   1. Le prospect a manifesté un intérêt réel
//   2. Lara a proposé l'accompagnement humain
//   3. Le prospect a explicitement accepté
//   4. Les informations minimales ont été collectées (au moins nom + email)
//
// Ce service:
//   - Détecte le marqueur dans la réponse du LLM
//   - Valide les données (nom + email obligatoires)
//   - Vérifie l'anti-doublon (même email + sujet "Prospect Lara" dans la dernière heure)
//   - Crée un ContactMessage réel en DB
//   - Retourne le texte utilisateur (sans le marqueur) + statut de transmission
// ============================================================================

import { db } from '@/lib/db';

const MARKER_START = '[PROSPECT_TRANSMIT]';
const MARKER_END = '[/PROSPECT_TRANSMIT]';
const PROSPECT_SUBJECT = 'Prospect Lara — Demande d accompagnement';

export interface ProspectData {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  level?: string;       // niveau scolaire actuel
  program?: string;    // formation/niveau souhaité
  mode?: string;       // présentiel/en ligne (si connu)
  summary?: string;     // résumé du besoin
}

export interface ProspectResult {
  cleanedReply: string;     // texte à afficher à l'utilisateur (sans le marqueur)
  transmitted: boolean;      // ContactMessage créé avec succès ?
  error?: string;            // message d'erreur si échec
}

// === Conversation message type for consent verification ===
interface ConversationMsg {
  role: string;
  content: string;
}

// === Vérification serveur du consentement explicite ===
// Scanne les messages utilisateur (role='user') dans l'historique de conversation
// pour détecter une réponse affirmative à une proposition de transmission.
// CONSERVATEUR: si aucun consentement clair n'est trouvé, BLOQUE la transmission.
//
// Mots-clés affirmatifs (insensibles à la casse):
//   - "oui" (mais pas dans une question comme "oui ?" ou "oui c'est quoi")
//   - "d'accord", "je suis d'accord"
//   - "je veux bien", "je souhaite", "volontiers"
//   - "parfait", "très bien" (en réponse courte < 80 chars)
//   - "transmettez", "vous pouvez transmettre"
//   - "ok", "d'acc"
//
// Le consentement doit venir d'un message UTILISATEUR, pas du LLM.
// Un message ambigu comme "Oui, c'est quoi le QHSE ?" ne compte PAS.
function verifyConsent(history: ConversationMsg[]): boolean {
  // Filtrer uniquement les messages utilisateur
  const userMessages = history.filter(m => m.role === 'user');
  if (userMessages.length === 0) return false;

  // Mots-clés d'affirmation directe (message court = réponse à une question oui/non)
  const affirmativeDirect = [
    /^\s*oui\s*[,!.]?\s*$/i,           // "oui", "oui.", "oui!" (standalone uniquement)
    /^\s*d[''']accord\s*[,!.]?\s*$/i,  // "d'accord"
    /^\s*je suis d[''']accord/i,        // "je suis d'accord"
    /^\s*je veux bien/i,                // "je veux bien"
    /^\s*volontiers/i,                 // "volontiers"
    /^\s*parfait\s*[,!.]?\s*$/i,       // "parfait"
    /^\s*ok\s*[,!.]?\s*$/i,            // "ok"
    /^\s*très bien\s*[,!.]?\s*$/i,     // "très bien"
  ];

  // Mots-clés de consentement explicite à la transmission (peu importe la longueur)
  const consentExplicit = [
    /oui.*transmett/i,              // "oui transmettez"
    /oui.*contact/i,                // "oui contactez-moi"
    /je veux.*contact/i,            // "je veux être contacté"
    /je souhaite.*transmet/i,       // "je souhaite que vous transmettiez"
    /je suis d[''']accord.*transmet/i,
    /vous pouvez.*transmet/i,      // "vous pouvez transmettre"
    /j['\u2018\u2019]accepte/i,        // "j'accepte" (apostrophe droite + typographique)
    /^\s*oui[,\s].*contact/i,
    /^\s*oui[,\s].*accompagn/i,
  ];

  // Analyser les derniers messages utilisateur (les 5 derniers suffisent)
  const recent = userMessages.slice(-5);

  for (const msg of recent) {
    const content = msg.content.trim();
    const isShort = content.length < 80;

    // Pour les messages courts, vérifier les patterns d'affirmation directe
    if (isShort) {
      for (const pattern of affirmativeDirect) {
        if (pattern.test(content)) {
          return true;
        }
      }
    }

    // Pour tous les messages, vérifier le consentement explicite à la transmission
    for (const pattern of consentExplicit) {
      if (pattern.test(content)) {
        return true;
      }
    }
  }

  return false; // Pas de consentement trouvé → BLOQUER
}

// === Détecter et traiter un marqueur PROSPECT_TRANSMIT ===
export async function processProspectTransmit(
  llmReply: string,
  conversationHistory?: ConversationMsg[],
): Promise<ProspectResult> {
  // Vérifier si le marqueur est présent
  const startIdx = llmReply.indexOf(MARKER_START);
  const endIdx = llmReply.indexOf(MARKER_END);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    // Pas de marqueur — réponse normale
    return { cleanedReply: llmReply, transmitted: false };
  }

  // Extraire le JSON entre les marqueurs
  const jsonBlock = llmReply.substring(startIdx + MARKER_START.length, endIdx).trim();
  let prospect: ProspectData;
  try {
    prospect = JSON.parse(jsonBlock);
  } catch {
    // JSON invalide — ne pas transmettre, garder la réponse telle quelle
    console.error('[prospect] Invalid JSON in transmit marker');
    return {
      cleanedReply: llmReply.replace(
        new RegExp(escapeRegex(MARKER_START) + '[\\s\\S]*?' + escapeRegex(MARKER_END), 'g'),
        ''
      ).trim(),
      transmitted: false,
      error: 'Données de transmission invalides',
    };
  }

  // Valider les champs obligatoires
  if (!prospect.name || typeof prospect.name !== 'string' || prospect.name.trim().length < 2) {
    return {
      cleanedReply: stripMarker(llmReply),
      transmitted: false,
      error: 'Nom manquant ou invalide',
    };
  }
  if (!prospect.email || !isValidEmail(prospect.email)) {
    return {
      cleanedReply: stripMarker(llmReply),
      transmitted: false,
      error: 'Email manquant ou invalide',
    };
  }

  // [SÉCURITÉ] Vérification serveur du consentement explicite
  // Le LLM (instruit par EDU LARA N°05) ne doit générer le marqueur qu'après consentement.
  // MAIS le serveur ne fait PAS confiance au LLM seul.
  // Il vérifie indépendamment que l'utilisateur a effectivement donné son accord
  // dans l'historique de conversation.
  // Si aucun consentement n'est trouvé → BLOCAGE de la transmission.
  if (conversationHistory && conversationHistory.length > 0) {
    const hasConsent = verifyConsent(conversationHistory);
    if (!hasConsent) {
      // Consentement non vérifié côté serveur — BLOQUER
      console.warn('[prospect] Consent not verified in conversation history — blocking transmission');
      return {
        cleanedReply: stripMarker(llmReply),
        transmitted: false,
        error: 'Consent not verified',
      };
    }
  } else {
    // Pas d'historique disponible (visiteur sans conversation persistée)
    // CONSERVATEUR: bloquer si on ne peut pas vérifier le consentement
    console.warn('[prospect] No conversation history available — blocking transmission');
    return {
      cleanedReply: stripMarker(llmReply),
      transmitted: false,
      error: 'Consent not verifiable',
    };
  }

  // Anti-doublon: vérifier si un prospect avec le même email + sujet a déjà été créé dans la dernière heure
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existing = await db.contactMessage.findFirst({
      where: {
        email: prospect.email.trim().toLowerCase(),
        subject: { contains: 'Prospect Lara' },
        createdAt: { gt: oneHourAgo },
      },
      select: { id: true },
    });
    if (existing) {
      // Doublon — ne pas créer, mais informer l'utilisateur que la demande existe déjà
      return {
        cleanedReply: stripMarker(llmReply) + '\n\n*(Votre demande a déjà été transmise à notre équipe. Le responsable vous contactera prochainement.)*',
        transmitted: true,
      };
    }
  } catch {
    // Si la vérification échoue, continuer (graceful — mieux vaut transmettre que bloquer)
  }

  // Construire le message structuré pour le responsable
  const messageLines: string[] = [
    'Origine : Lara (Assistant IA)',
    'Type : Prospect intéressé',
    '',
    `Pays : ${prospect.country || 'Non précisé'}`,
    `Niveau actuel : ${prospect.level || 'Non précisé'}`,
    `Formation souhaitée : ${prospect.program || 'Non précisé'}`,
    `Mode souhaité : ${prospect.mode || 'Non précisé'}`,
    '',
    `Résumé : ${prospect.summary || 'Voir conversation avec Lara'}`,
  ];

  // Créer le ContactMessage
  try {
    await db.contactMessage.create({
      data: {
        name: prospect.name.trim(),
        email: prospect.email.trim().toLowerCase(),
        phone: prospect.phone?.trim() || null,
        subject: PROSPECT_SUBJECT,
        message: messageLines.join('\n'),
        read: false,
      },
    });

    // Succès — nettoyer la réponse + ajouter confirmation
    const cleaned = stripMarker(llmReply);
    return {
      cleanedReply: cleaned,
      transmitted: true,
    };
  } catch (error: any) {
    console.error('[prospect] Failed to create ContactMessage:', error?.message);
    // Échec — ne PAS prétendre que la transmission a réussi
    return {
      cleanedReply: stripMarker(llmReply),
      transmitted: false,
      error: 'Erreur lors de la transmission',
    };
  }
}

// === Helpers ===
function stripMarker(text: string): string {
  return text.replace(
    new RegExp(escapeRegex(MARKER_START) + '[\\s\\S]*?' + escapeRegex(MARKER_END), 'g'),
    ''
  ).trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}
