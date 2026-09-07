-- Migration additive — CV customization fields
ALTER TABLE "UserProfile" ADD COLUMN "cvColorPrimary" TEXT NOT NULL DEFAULT '#059669';
ALTER TABLE "UserProfile" ADD COLUMN "cvColorAccent" TEXT NOT NULL DEFAULT '#065f46';
ALTER TABLE "UserProfile" ADD COLUMN "cvLayout" TEXT NOT NULL DEFAULT 'sidebar';
-- Update existing default from 'modern' to 'emerald'
UPDATE "UserProfile" SET "cvTemplate" = 'emerald' WHERE "cvTemplate" = 'modern';
