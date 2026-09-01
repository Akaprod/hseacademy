-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Formation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL DEFAULT '',
    "level" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "durationHours" TEXT,
    "prerequisites" TEXT,
    "objectives" TEXT NOT NULL DEFAULT '[]',
    "program" TEXT NOT NULL DEFAULT '[]',
    "price" TEXT,
    "priceIndividual" TEXT,
    "priceGroup" TEXT,
    "priceEnterprise" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'presentiel',
    "type" TEXT NOT NULL DEFAULT 'diplomante',
    "coverImage" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Formation" ("coverImage", "createdAt", "duration", "featured", "fullDescription", "id", "level", "mode", "objectives", "order", "prerequisites", "price", "program", "shortDescription", "slug", "title", "updatedAt") SELECT "coverImage", "createdAt", "duration", "featured", "fullDescription", "id", "level", "mode", "objectives", "order", "prerequisites", "price", "program", "shortDescription", "slug", "title", "updatedAt" FROM "Formation";
DROP TABLE "Formation";
ALTER TABLE "new_Formation" RENAME TO "Formation";
CREATE UNIQUE INDEX "Formation_slug_key" ON "Formation"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
