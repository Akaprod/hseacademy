-- ============================================================================
-- Migration: add_assistant_visitor_quota
-- ============================================================================
-- Date: 2026-09-14
-- Type: ADDITIVE (creates new table, no destructive changes)
--
-- Cause: AssistantVisitorQuota model exists in prisma/schema.prisma
--        but the table was never created in the local DB (likely because
--        prisma db push was not re-run after the model was added).
--        Without this table, checkQuota/incrementQuota silently fail
--        (caught by try/catch) → visitors effectively have UNLIMITED quota.
--
-- SQL: additive CREATE TABLE with IF NOT EXISTS guard.
--      Mirrors the model definition in prisma/schema.prisma.
--      No FK because visitorId is a cookie value (UUID), not a DB row.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "assistant_visitor_quota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitorId" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "windowStart" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Unique constraint on visitorId (matches @@unique in schema)
CREATE UNIQUE INDEX IF NOT EXISTS "assistant_visitor_quota_visitorId_key"
    ON "assistant_visitor_quota"("visitorId");
