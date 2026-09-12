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
}
