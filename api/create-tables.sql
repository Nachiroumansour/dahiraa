-- Script pour créer toutes les tables de l'application Dahiraa

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table des membres
CREATE TABLE IF NOT EXISTS "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" DATETIME,
    "lieuNaissance" TEXT,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "profession" TEXT,
    "dateAdhesion" DATETIME,
    "numeroAdherent" TEXT,
    "statut" TEXT DEFAULT 'ACTIF',
    "photo" TEXT,
    "commission" TEXT,
    "niveauArabe" TEXT,
    "categorie" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table des cotisations
CREATE TABLE IF NOT EXISTS "Cotisation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "datePaiement" DATETIME NOT NULL,
    "mois" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "typePaiement" TEXT DEFAULT 'ESPECES',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE
);

-- Table des événements
CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME,
    "lieu" TEXT,
    "type" TEXT DEFAULT 'REUNION',
    "statut" TEXT DEFAULT 'PLANIFIE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table des dépenses
CREATE TABLE IF NOT EXISTS "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "montant" REAL NOT NULL,
    "dateDepense" DATETIME NOT NULL,
    "categorie" TEXT DEFAULT 'AUTRE',
    "justificatif" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS "Member_email_idx" ON "Member"("email");
CREATE INDEX IF NOT EXISTS "Member_statut_idx" ON "Member"("statut");
CREATE INDEX IF NOT EXISTS "Cotisation_memberId_idx" ON "Cotisation"("memberId");
CREATE INDEX IF NOT EXISTS "Cotisation_datePaiement_idx" ON "Cotisation"("datePaiement");
CREATE INDEX IF NOT EXISTS "Event_dateDebut_idx" ON "Event"("dateDebut");
CREATE INDEX IF NOT EXISTS "Expense_dateDepense_idx" ON "Expense"("dateDepense"); 