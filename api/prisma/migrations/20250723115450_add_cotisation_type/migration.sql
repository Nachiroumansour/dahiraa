-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cotisations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "semaine" DATETIME NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'PAYE',
    "type" TEXT NOT NULL DEFAULT 'HEBDOMADAIRE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cotisations_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_cotisations" ("createdAt", "id", "memberId", "montant", "semaine", "statut", "updatedAt") SELECT "createdAt", "id", "memberId", "montant", "semaine", "statut", "updatedAt" FROM "cotisations";
DROP TABLE "cotisations";
ALTER TABLE "new_cotisations" RENAME TO "cotisations";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
