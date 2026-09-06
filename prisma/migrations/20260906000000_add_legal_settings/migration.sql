-- Migration additive — LegalSettings (singleton)
-- ============================================================================
-- Crée UNIQUEMENT la table LegalSettings correspondant au modèle Prisma.
-- Aucune suppression, aucune modification d'autres tables, aucune donnée.
-- ============================================================================

CREATE TABLE "LegalSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "legalName" TEXT,
    "commercialName" TEXT,
    "representative" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "ice" TEXT,
    "rc" TEXT,
    "if" TEXT,
    "authorizationRef" TEXT,
    "authorityName" TEXT,
    "cndpReceipt" TEXT,
    "refundPolicy" TEXT,
    "privacyPolicy" TEXT,
    "termsOfService" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
