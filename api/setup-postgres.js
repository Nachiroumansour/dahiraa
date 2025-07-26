const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

async function setupPostgreSQL() {
  console.log('🔧 Configuration de PostgreSQL...');
  
  // Récupérer l'URL de la base de données depuis les variables d'environnement
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL non définie');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL');

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'create-postgres-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Exécuter le script SQL
    await client.query(sqlContent);
    console.log('✅ Tables créées avec succès');

    // Créer les utilisateurs avec des mots de passe hashés
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Vérifier si les utilisateurs existent déjà
    const existingUsers = await client.query('SELECT email FROM "User" WHERE email IN ($1, $2)', 
      ['admin@dahiraa.com', 'test@dahiraa.com']);

    const existingEmails = existingUsers.rows.map(row => row.email);

    if (!existingEmails.includes('admin@dahiraa.com')) {
      await client.query(
        'INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6)',
        [randomUUID(), 'admin@dahiraa.com', hashedPassword, 'ADMIN', new Date(), new Date()]
      );
      console.log('✅ Utilisateur admin@dahiraa.com créé');
    }

    if (!existingEmails.includes('test@dahiraa.com')) {
      await client.query(
        'INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6)',
        [randomUUID(), 'test@dahiraa.com', hashedPassword, 'ADMIN', new Date(), new Date()]
      );
      console.log('✅ Utilisateur test@dahiraa.com créé');
    }

    console.log('🎉 Base de données PostgreSQL configurée avec succès !');
    console.log('📋 Identifiants: admin@dahiraa.com / admin123');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  setupPostgreSQL()
    .then(() => {
      console.log('✅ Configuration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { setupPostgreSQL }; 