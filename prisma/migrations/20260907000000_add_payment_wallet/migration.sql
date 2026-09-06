-- Migration additive — Payment Wallet System
-- ============================================================================
-- Ajoute : Wallet, WalletTransaction, PaymentSettings
-- Ne modifie aucune table existante (sauf User qui gagne une relation Wallet)
-- Aucune suppression, aucune donnée touchée
-- ============================================================================

-- CreateTable — Wallet (1 par utilisateur)
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateTable — WalletTransaction (historique des opérations)
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "coursePaymentId" TEXT,
    "attestationPaymentId" TEXT,
    "paymentMethod" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "promotionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "WalletTransaction_walletId_idx" ON "WalletTransaction"("walletId");
CREATE INDEX "WalletTransaction_type_idx" ON "WalletTransaction"("type");

-- CreateTable — PaymentSettings (singleton, paramètres admin)
CREATE TABLE "PaymentSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "attestationPrintPrice" REAL NOT NULL DEFAULT 190,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "paypalEnabled" BOOLEAN NOT NULL DEFAULT true,
    "paypalEmail" TEXT,
    "stripeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripePublicKey" TEXT,
    "stripeSecretKey" TEXT,
    "bankTransferEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bankName" TEXT,
    "bankAccountName" TEXT,
    "bankIban" TEXT,
    "bankSwift" TEXT,
    "bankNotes" TEXT,
    "walletEnabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsappNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
