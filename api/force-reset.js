const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

async function forceReset() {
  console.log('🔄 FORÇAGE de la réinitialisation complète...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL non définie');
    return;
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL');

    // Supprimer TOUTES les tables
    console.log('🗑️ Suppression FORCÉE de toutes les tables...');
    await client.query('DROP TABLE IF EXISTS "Cotisation" CASCADE');
    await client.query('DROP TABLE IF EXISTS "Evenement" CASCADE');
    await client.query('DROP TABLE IF EXISTS "Expense" CASCADE');
    await client.query('DROP TABLE IF EXISTS "Member" CASCADE');
    await client.query('DROP TABLE IF EXISTS "User" CASCADE');

    // Recréer TOUTES les tables
    console.log('🏗️ Recréation de toutes les tables...');
    const createTablesSQL = `
      -- Table des utilisateurs
      CREATE TABLE "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'ADMIN',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );

      -- Table des membres
      CREATE TABLE "Member" (
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
      CREATE TABLE "Cotisation" (
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
      CREATE TABLE "Evenement" (
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
      CREATE TABLE "Expense" (
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
      CREATE INDEX "User_email_idx" ON "User"("email");
      CREATE INDEX "Member_email_idx" ON "Member"("email");
      CREATE INDEX "Member_telephone_idx" ON "Member"("telephone");
      CREATE INDEX "Cotisation_memberId_idx" ON "Cotisation"("memberId");
      CREATE INDEX "Cotisation_datePaiement_idx" ON "Cotisation"("datePaiement");
      CREATE INDEX "Evenement_dateDebut_idx" ON "Evenement"("dateDebut");
      CREATE INDEX "Expense_date_idx" ON "Expense"("date");

      -- Contraintes de clés étrangères
      ALTER TABLE "Cotisation" ADD CONSTRAINT "Cotisation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    `;

    await client.query(createTablesSQL);
    console.log('✅ Tables recréées avec succès');

    // Créer les utilisateurs avec des IDs FIXES
    console.log('👥 Création des utilisateurs avec IDs fixes...');
    const adminId = 'admin-user-12345';
    const testId = 'test-user-67890';
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await client.query(
      'INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6)',
      [adminId, 'admin@dahiraa.com', hashedPassword, 'ADMIN', new Date(), new Date()]
    );

    await client.query(
      'INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6)',
      [testId, 'test@dahiraa.com', hashedPassword, 'ADMIN', new Date(), new Date()]
    );

    console.log('✅ Utilisateurs créés avec IDs fixes:');
    console.log(`- admin@dahiraa.com (ID: ${adminId})`);
    console.log(`- test@dahiraa.com (ID: ${testId})`);

    // Vérifier que tout fonctionne
    const users = await client.query('SELECT id, email, role FROM "User"');
    console.log('📋 Utilisateurs dans la base:');
    users.rows.forEach(user => {
      console.log(`- ${user.email} (${user.id})`);
    });

    console.log('🎉 RÉINITIALISATION FORCÉE TERMINÉE !');
    console.log('🔑 Identifiants: admin@dahiraa.com / admin123');
    console.log('⚠️ IMPORTANT: Les anciens tokens ne fonctionneront plus !');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation forcée:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  forceReset()
    .then(() => {
      console.log('✅ Réinitialisation forcée terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { forceReset }; 