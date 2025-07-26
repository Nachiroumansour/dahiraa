const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

// Chemin vers la base de données
const dbPath = process.env.DATABASE_URL || 'prisma/dev.db';

async function setupDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erreur de connexion à la base de données:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Connexion à la base de données SQLite établie');
    });

    // Script SQL complet pour créer toutes les tables
    const sql = `
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
          "adresseComplement" TEXT,
          "telephone" TEXT,
          "email" TEXT,
          "profession" TEXT,
          "genre" TEXT,
          "situationMatrimoniale" TEXT,
          "decouverteDahira" TEXT,
          "dateAdhesion" DATETIME,
          "numeroAdhesion" TEXT,
          "statut" TEXT DEFAULT 'ACTIF',
          "photo" TEXT,
          "commission" TEXT,
          "niveauArabe" TEXT,
          "categorie" TEXT,
          "antecedentsMedicaux" TEXT,
          "allergies" TEXT,
          "traitements" TEXT,
          "contactUrgenceTel" TEXT,
          "typeAutorite" TEXT,
          "contactUrgenceNom" TEXT,
          "contactUrgencePrenom" TEXT,
          "contactUrgenceTelephone" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Table des cotisations
      CREATE TABLE IF NOT EXISTS "Cotisation" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "memberId" TEXT NOT NULL,
          "montant" REAL NOT NULL,
          "datePaiement" DATETIME NOT NULL,
          "type" TEXT DEFAULT 'MENSUELLE',
          "mois" TEXT,
          "annee" INTEGER,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE
      );

      -- Table des événements
      CREATE TABLE IF NOT EXISTS "Evenement" (
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
          "montant" REAL NOT NULL,
          "date" DATETIME NOT NULL,
          "categorie" TEXT,
          "description" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Exécuter le script SQL
    db.exec(sql, async (err) => {
      if (err) {
        console.error('❌ Erreur lors de la création des tables:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Tables créées avec succès');

      // Créer l'utilisateur admin
      try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const userId = randomUUID();
        
        db.run(`
          INSERT OR IGNORE INTO "User" (id, email, password, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [userId, 'admin@dahiraa.com', hashedPassword, 'ADMIN'], (err) => {
          if (err) {
            console.error('❌ Erreur lors de la création de l\'utilisateur admin:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Utilisateur admin créé avec succès');
          
          // Créer un utilisateur test
          const testUserId = randomUUID();
          db.run(`
            INSERT OR IGNORE INTO "User" (id, email, password, role, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [testUserId, 'test@dahiraa.com', hashedPassword, 'ADMIN'], (err) => {
            if (err) {
              console.error('❌ Erreur lors de la création de l\'utilisateur test:', err.message);
              reject(err);
              return;
            }
            console.log('✅ Utilisateur test créé avec succès');
            console.log('🎉 Base de données initialisée avec succès !');
            resolve();
          });
        });
      } catch (error) {
        console.error('❌ Erreur lors du hashage du mot de passe:', error.message);
        reject(error);
      }
    });
  });
}

// Exécuter le script
setupDatabase()
  .then(() => {
    console.log('✅ Initialisation terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    process.exit(1);
  }); 