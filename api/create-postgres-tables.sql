-- Script pour créer les tables PostgreSQL pour l'application Dahiraa

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Table des membres
CREATE TABLE IF NOT EXISTS "Member" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3),
    "genre" TEXT,
    "categorie" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "pays" TEXT DEFAULT 'Sénégal',
    "photo" TEXT,
    "statut" TEXT DEFAULT 'ACTIF',
    "dateAdhesion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- Table des cotisations
CREATE TABLE IF NOT EXISTS "Cotisation" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "datePaiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT DEFAULT 'MENSUELLE',
    "mois" INTEGER,
    "annee" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cotisation_pkey" PRIMARY KEY ("id")
);

-- Table des événements
CREATE TABLE IF NOT EXISTS "Evenement" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "lieu" TEXT,
    "type" TEXT DEFAULT 'REUNION',
    "statut" TEXT DEFAULT 'PLANIFIE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evenement_pkey" PRIMARY KEY ("id")
);

-- Table des dépenses
CREATE TABLE IF NOT EXISTS "Expense" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "montant" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categorie" TEXT,
    "statut" TEXT DEFAULT 'EN_COURS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "Member_email_idx" ON "Member"("email");
CREATE INDEX IF NOT EXISTS "Member_telephone_idx" ON "Member"("telephone");
CREATE INDEX IF NOT EXISTS "Cotisation_memberId_idx" ON "Cotisation"("memberId");
CREATE INDEX IF NOT EXISTS "Cotisation_datePaiement_idx" ON "Cotisation"("datePaiement");
CREATE INDEX IF NOT EXISTS "Evenement_dateDebut_idx" ON "Evenement"("dateDebut");
CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense"("date");

-- Contraintes de clés étrangères
ALTER TABLE "Cotisation" ADD CONSTRAINT "Cotisation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insérer les utilisateurs par défaut
INSERT INTO "User" ("id", "email", "password", "role", "createdAt", "updatedAt") VALUES
('admin-1', 'admin@dahiraa.com', '$2a$10$rQZ8K9mN2pL4vX7yJ1hF3eG6tY8uI0oP1qR2sT3uV4wX5yZ6aA7bB8cC9dD0eE1fF2gG3hH4iI5jJ6kK7lL8mM9nN0oO1pP2qQ3rR4sS5tT6uU7vV8wW9xX0yY1zZ', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('admin-2', 'test@dahiraa.com', '$2a$10$rQZ8K9mN2pL4vX7yJ1hF3eG6tY8uI0oP1qR2sT3uV4wX5yZ6aA7bB8cC9dD0eE1fF2gG3hH4iI5jJ6kK7lL8mM9nN0oO1pP2qQ3rR4sS5tT6uU7vV8wW9xX0yY1zZ', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING; 