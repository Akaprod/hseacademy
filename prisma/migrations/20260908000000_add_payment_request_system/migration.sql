-- Migration additive — Payment Request System
CREATE TABLE "PaymentRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reqType" TEXT NOT NULL DEFAULT 'wallet_charge',
    "amount" REAL NOT NULL,
    "method" TEXT NOT NULL,
    "reqStatus" TEXT NOT NULL DEFAULT 'pending',
    "description" TEXT NOT NULL DEFAULT '',
    "expiresAt" DATETIME NOT NULL,
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
    CONSTRAINT "PaymentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "PaymentRequest_userId_idx" ON "PaymentRequest"("userId");
CREATE INDEX "PaymentRequest_reqStatus_idx" ON "PaymentRequest"("reqStatus");
CREATE INDEX "PaymentRequest_reqType_idx" ON "PaymentRequest"("reqType");
