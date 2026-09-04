-- AT-P2 : Ajout des champs de statut et de révocation à CourseAttestation
-- Migration additive uniquement (aucune suppression, aucune modification de données existantes)
-- Les valeurs par défaut garantissent que les attestations existantes reçoivent status='valid'
-- et revokedAt/revokedReason/revokedBy = NULL.

-- AddColumn status
ALTER TABLE "CourseAttestation" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'valid';

-- AddColumn revokedAt
ALTER TABLE "CourseAttestation" ADD COLUMN "revokedAt" DATETIME;

-- AddColumn revokedReason
ALTER TABLE "CourseAttestation" ADD COLUMN "revokedReason" TEXT;

-- AddColumn revokedBy
ALTER TABLE "CourseAttestation" ADD COLUMN "revokedBy" TEXT;
