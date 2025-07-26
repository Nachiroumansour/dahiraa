const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('crypto');

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

    // Lire le fichier SQL
    const fs = require('fs');
    const sql = fs.readFileSync('./create-tables.sql', 'utf8');

    // Exécuter le script SQL
    db.exec(sql, async (err) => {
      if (err) {
        console.error('❌ Erreur lors de la création des tables:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Tables créées avec succès');

      // Créer un utilisateur admin
      try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const userId = uuidv4();
        
        db.run(`
          INSERT OR IGNORE INTO "User" (id, email, password, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [userId, 'admin@dahiraa.com', hashedPassword, 'ADMIN'], function(err) {
          if (err) {
            console.error('❌ Erreur lors de la création de l\'utilisateur admin:', err.message);
            reject(err);
            return;
          }
          
          if (this.changes > 0) {
            console.log('✅ Utilisateur admin créé avec succès');
          } else {
            console.log('ℹ️ Utilisateur admin existe déjà');
          }

          // Créer un utilisateur de test
          const testUserId = uuidv4();
          db.run(`
            INSERT OR IGNORE INTO "User" (id, email, password, role, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
          `, [testUserId, 'test@dahiraa.com', hashedPassword, 'ADMIN'], function(err) {
            if (err) {
              console.error('❌ Erreur lors de la création de l\'utilisateur test:', err.message);
              reject(err);
              return;
            }
            
            if (this.changes > 0) {
              console.log('✅ Utilisateur test créé avec succès');
            } else {
              console.log('ℹ️ Utilisateur test existe déjà');
            }

            console.log('\n🎉 Base de données configurée avec succès !');
            console.log('\n📋 Identifiants de connexion :');
            console.log('   Admin: admin@dahiraa.com / admin123');
            console.log('   Test: test@dahiraa.com / admin123');
            
            db.close((err) => {
              if (err) {
                console.error('❌ Erreur lors de la fermeture de la base de données:', err.message);
              } else {
                console.log('✅ Connexion à la base de données fermée');
              }
              resolve();
            });
          });
        });
      } catch (error) {
        console.error('❌ Erreur lors du hashage du mot de passe:', error);
        reject(error);
      }
    });
  });
}

setupDatabase().catch(console.error); 