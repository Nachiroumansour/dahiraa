const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    console.log('🚀 Initialisation de la base de données...');
    
    // Vérifier si l'utilisateur admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@dahiraa.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ Utilisateur admin existe déjà');
      return;
    }
    
    // Créer l'utilisateur admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@dahiraa.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Utilisateur admin créé avec succès :');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Rôle: ${adminUser.role}`);
    console.log(`   ID: ${adminUser.id}`);
    
    // Créer un utilisateur de test
    const testUser = await prisma.user.create({
      data: {
        email: 'test@dahiraa.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Utilisateur de test créé avec succès :');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Rôle: ${testUser.role}`);
    console.log(`   ID: ${testUser.id}`);
    
    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('\n📋 Identifiants de connexion :');
    console.log('   Admin: admin@dahiraa.com / admin123');
    console.log('   Test: test@dahiraa.com / admin123');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase(); 