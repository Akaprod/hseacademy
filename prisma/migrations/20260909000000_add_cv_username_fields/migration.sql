-- Migration additive — CV Public (username + visibilité + champs CV)
-- Ajoute des colonnes à UserProfile — ne supprime rien, ne modifie pas les données existantes.

ALTER TABLE "UserProfile" ADD COLUMN "username" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN "profilePublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserProfile" ADD COLUMN "cvTemplate" TEXT NOT NULL DEFAULT 'modern';
ALTER TABLE "UserProfile" ADD COLUMN "cvTitle" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN "cvBio" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN "cvSkills" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "UserProfile" ADD COLUMN "cvExperience" TEXT NOT NULL DEFAULT '[]';

CREATE UNIQUE INDEX "UserProfile_username_key" ON "UserProfile"("username");
