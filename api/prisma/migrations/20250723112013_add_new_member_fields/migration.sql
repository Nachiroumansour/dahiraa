/*
  Warnings:

  - You are about to drop the column `dateInscription` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `groupeSanguin` on the `members` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "adresse" TEXT NOT NULL,
    "adresseComplement" TEXT,
    "profession" TEXT,
    "genre" TEXT NOT NULL,
    "dateNaissance" DATETIME NOT NULL,
    "situationMatrimoniale" TEXT,
    "dateAdhesion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decouverteDahira" TEXT,
    "commission" TEXT,
    "niveauArabe" TEXT,
    "antecedentsMedicaux" TEXT,
    "allergies" TEXT,
    "traitements" TEXT,
    "contactUrgenceTel" TEXT,
    "typeAutorite" TEXT,
    "contactUrgenceNom" TEXT,
    "contactUrgencePrenom" TEXT,
    "contactUrgenceTelephone" TEXT,
    "numeroAdhesion" TEXT NOT NULL,
    "photoProfile" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_members" ("adresse", "antecedentsMedicaux", "contactUrgenceNom", "contactUrgenceTel", "createdAt", "dateNaissance", "genre", "id", "nom", "numeroAdhesion", "photoProfile", "prenom", "telephone", "updatedAt") SELECT "adresse", "antecedentsMedicaux", "contactUrgenceNom", "contactUrgenceTel", "createdAt", "dateNaissance", "genre", "id", "nom", "numeroAdhesion", "photoProfile", "prenom", "telephone", "updatedAt" FROM "members";
DROP TABLE "members";
ALTER TABLE "new_members" RENAME TO "members";
CREATE UNIQUE INDEX "members_telephone_key" ON "members"("telephone");
CREATE UNIQUE INDEX "members_numeroAdhesion_key" ON "members"("numeroAdhesion");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
