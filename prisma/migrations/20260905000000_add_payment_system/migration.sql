-- Phase 3 — Payment system
-- Migration additive uniquement (aucune suppression, aucune modification destructive)
-- Ajoute : CoursePayment, AttestationPayment, champs Enrollment

-- ============================================================================
-- 1. Enrollment — nouveaux champs
-- ============================================================================

ALTER TABLE "Enrollment" ADD COLUMN "courseOrderIndex" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Enrollment" ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'not_required';

-- ============================================================================
-- 2. CoursePayment — paiement cours (120 MAD)
-- ============================================================================

CREATE TABLE "CoursePayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "proofPath" TEXT,
    "proofOriginalName" TEXT,
    "proofMimeType" TEXT,
    "proofSize" INTEGER,
    "submittedAt" DATETIME,
    "validatedAt" DATETIME,
    "validatedBy" TEXT,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoursePayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoursePayment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CoursePayment_enrollmentId_key" ON "CoursePayment"("enrollmentId");
CREATE INDEX "CoursePayment_userId_idx" ON "CoursePayment"("userId");
CREATE INDEX "CoursePayment_status_idx" ON "CoursePayment"("status");
CREATE INDEX "CoursePayment_courseId_idx" ON "CoursePayment"("courseId");

-- ============================================================================
-- 3. AttestationPayment — paiement impression (190 MAD)
-- ============================================================================

CREATE TABLE "AttestationPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "attestationId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "proofPath" TEXT,
    "proofOriginalName" TEXT,
    "proofMimeType" TEXT,
    "proofSize" INTEGER,
    "submittedAt" DATETIME,
    "validatedAt" DATETIME,
    "validatedBy" TEXT,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AttestationPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "AttestationPayment_userId_idx" ON "AttestationPayment"("userId");
CREATE INDEX "AttestationPayment_attestationId_idx" ON "AttestationPayment"("attestationId");
CREATE INDEX "AttestationPayment_status_idx" ON "AttestationPayment"("status");
