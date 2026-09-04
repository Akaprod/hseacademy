-- AT-P5 : Ajout des champs serialNumber et signatureHash à CourseAttestation
-- Migration additive multi-étapes pour préserver les données existantes.
--
-- Étape 1 (cette migration) : ajout des colonnes NULLABLE.
--   - serialNumber TEXT (nullable pour l'instant)
--   - signatureHash TEXT (nullable pour l'instant)
--
-- Étape 2 (post-migration, script Node.js séparé) : backfill des attestations
--   existantes avec serialNumber + signatureHash calculés à partir de leurs
--   données réelles.
--
-- Étape 3 (migration suivante, après vérification du backfill) :
--   - ALTER pour rendre serialNumber NOT NULL UNIQUE
--   - ALTER pour rendre signatureHash NOT NULL
--   (SQLite ne supporte pas ALTER COLUMN, on utilisera recreate table)
--
-- Cette approche évite tout risque de casser la DB existante.

ALTER TABLE "CourseAttestation" ADD COLUMN "serialNumber" TEXT;
ALTER TABLE "CourseAttestation" ADD COLUMN "signatureHash" TEXT;
