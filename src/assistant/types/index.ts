// ============================================================================
// ASSISTANT IA — Types partagés (Phase 1 + Phase 2)
// ============================================================================

export type AssistantMode = 'commercial' | 'user' | 'admin';

// 5 catégories d'instructions éditables (Phase 2 ajoute 'limits')
export type InstructionCategory = 'general' | 'commercial' | 'user' | 'admin' | 'limits';

export interface AssistantConfigData {
  // Phase 1
  enabled: boolean;
  commercialEnabled: boolean;
  userEnabled: boolean;
  adminEnabled: boolean;
  // Phase 2 — Configuration générale
  name: string;
  welcomeMessage: string;
  language: 'fr' | 'en' | 'ar';
  availabilityMode: 'always' | 'business_hours' | 'manual';
  // Lara Config — Limites de réponse + rate limiting
  responseMode: 'simple' | 'normal' | 'detailed';
  simpleMaxWords: number;
  normalMaxWords: number;
  detailedMaxWords: number;
  maxUserMessageLength: number;
  visitorMessageLimit: number;
  userMessageLimit: number;
  adminMessageLimit: number; // 0 = unlimited
  messageLimitPeriodHours: number;
  updatedAt?: string;
  updatedBy?: string | null;
}

export interface AssistantInstructionData {
  id: string;
  category: InstructionCategory;
  content: string;
  updatedAt: string;
  updatedBy?: string | null;
}

// Phase 2 — Personnalité
export type CommunicationStyle = 'professional' | 'commercial' | 'friendly' | 'pedagogical' | 'concise';
export type CommunicationTone = 'formal' | 'natural' | 'dynamic' | 'institutional';
export type ResponseLength = 'short' | 'normal' | 'detailed';

export interface AssistantBehaviorData {
  style: CommunicationStyle;
  tone: CommunicationTone;
  responseLength: ResponseLength;
  customGuidelines: string;
  updatedAt?: string;
  updatedBy?: string | null;
}

// Phase 2 — Sources de connaissance (articles retiré Étape 3.5)
export type KnowledgeSourceCategory =
  | 'formations' | 'courses' | 'promotions'
  | 'faq' | 'public_pages' | 'institutional';

export interface AssistantSourceConfigData {
  id: string;
  category: KnowledgeSourceCategory;
  enabled: boolean;
  isPublic: boolean;
  lastSyncAt: string | null;
  documentCount: number;
  updatedAt: string;
}

export interface AssistantStatus {
  enabled: boolean;
  welcomeMessage: string;
  name: string;
  modes: { commercial: boolean; user: boolean; admin: boolean };
  aiProviderConfigured: boolean;
  version: string;
}

export type MessageRole = 'user' | 'assistant' | 'system';
export interface AssistantMessage { id?: string; role: MessageRole; content: string; mode?: AssistantMode; createdAt?: string; }
export interface AssistantConversationData { id: string; userId: string; mode: AssistantMode; title?: string | null; createdAt: string; updatedAt: string; messages?: AssistantMessage[]; }

export interface ChatRequest { message: string; mode?: AssistantMode; conversationId?: string; }
export interface ChatResponse {
  mode: AssistantMode;
  reply: string;
  refused?: boolean;
  refusalReason?: string;
  conversationId?: string;
  requestId?: string;
}

// ============================================================================
// CONTEXTE UTILISATEUR AUTORISÉ (résolu serveur-side, READ-ONLY)
// ============================================================================
// Étendu Mission 2 — ajoute :
//   - walletSummary : solde + devise + 10 dernières transactions (entrées/sorties)
//   - attestationsSummary : attestations de l'utilisateur (statut + score)
//   - adminTargetContext : si admin ET message mentionne un autre utilisateur
//     avec un IDENTIFIANT UNIQUE (email OU téléphone — JAMAIS par nom seul),
//     contexte ciblé (résolu serveur-side).
//   - adminNeedsIdentity : si admin mentionne un utilisateur par nom seul,
//     on ne résout JAMAIS (nom = identifiant non unique). Lara doit demander
//     un email ou un téléphone.
// ============================================================================
// RÈGLE D'IDENTITÉ CRITIQUE :
//   - EMAIL = identifiant unique (User.email @unique en DB).
//   - TÉLÉPHONE = identifiant unique (en pratique — pas de doublon en DB).
//   - NOM/PRÉNOM = JAMAIS un identifiant unique. Ne JAMAIS résoudre un user
//     par son nom, même si un seul "Farid" existe en DB.
// ============================================================================

export interface WalletTransactionSummary {
  type: string;            // charge | purchase | refund | bonus
  amount: number;          // toujours positif (sens déterminé par type)
  description: string;
  paymentMethod?: string | null;
  createdAt: string;       // ISO date
}

export interface WalletSummary {
  balance: number;
  currency: string;        // "MAD" par défaut
  recentTransactions: WalletTransactionSummary[]; // 10 dernières
  totalCharges: number;    // somme des charges VALIDÉES + bonus + refund (entrées créditées)
  totalPurchases: number;  // somme des purchase (sorties)
}

export interface AttestationSummary {
  courseName: string;
  score: number | null;
  serialNumber: string;
  issuedDate: string;      // ISO date
  status?: string;
}

export interface AdminTargetContext {
  // Résolu serveur-side UNIQUEMENT par email OU téléphone (jamais par nom).
  // Le serveur parse le message, extrait un identifiant unique, vérifie en DB.
  targetUserId: string;
  targetUserName: string;
  targetUserEmail: string;
  targetUserRole: string;
  targetUserPhone?: string | null;
  walletSummary?: WalletSummary;
  enrollmentsSummary?: Array<{ courseTitle: string; status: string; overallScore?: number }>;
  attestationsSummary?: AttestationSummary[];
}

export interface AdminNeedsIdentity {
  // Quand l'admin mentionne un utilisateur par nom seul, on ne résout JAMAIS.
  // On signale à Lara qu'elle doit demander un email ou un téléphone.
  detectedName: string;  // le nom détecté dans le message admin
}

export interface AuthorizedUserContext {
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userRole: 'user' | 'admin' | null;
  profilePublicInfo?: {
    fullName?: string | null;
    cvTitle?: string | null;
    cvBio?: string | null;
    cvTemplate?: string | null;
    publicProfileUrl?: string | null;
  };
  enrollmentsSummary?: Array<{ courseTitle: string; status: string; overallScore?: number; }>;
  // Mission 2 — Wallet (solde + historique)
  walletSummary?: WalletSummary;
  // Mission 2 — Attestations
  attestationsSummary?: AttestationSummary[];
  // Mission 2/3 — Mode admin : si admin ET identifiant unique (email/tél) valide fourni,
  // contexte ciblé (RÉSOLU SERVEUR-SIDE — ne trust jamais email/ID du message).
  adminTargetContext?: AdminTargetContext;
  // Mission 3 — Mode admin : si admin mentionne un user par nom seul, on ne résout pas.
  // Lara doit demander un email ou téléphone pour identifier.
  adminNeedsIdentity?: AdminNeedsIdentity;
}
