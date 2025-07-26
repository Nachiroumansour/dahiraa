const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Supprimer les données existantes
  await prisma.cotisation.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();

  // Créer un utilisateur admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dahiraa.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  // Créer des membres de test
  const members = await Promise.all([
    prisma.member.create({
      data: {
        nom: 'Nachirou',
        prenom: 'Manou',
        telephone: '221701234567',
        email: 'manou@example.com',
        adresse: 'Dakar, Sénégal',
        profession: 'Enseignant',
        genre: 'HOMME',
        dateNaissance: new Date('1990-05-15'),
        numeroAdhesion: '344f',
        situationMatrimoniale: 'Marié',
        dateAdhesion: new Date('2023-01-15'),
        decouverteDahira: 'Via un membre',
        commission: 'Secrétaire General',
        niveauArabe: 'MOYEN'
      }
    }),
    prisma.member.create({
      data: {
        nom: 'Fall',
        prenom: 'Ibrahima',
        telephone: '221702345678',
        email: 'ibrahima@example.com',
        adresse: 'Thiès, Sénégal',
        profession: 'Ingénieur',
        genre: 'HOMME',
        dateNaissance: new Date('1985-08-20'),
        numeroAdhesion: 'DH019',
        situationMatrimoniale: 'Marié',
        dateAdhesion: new Date('2023-02-10'),
        decouverteDahira: 'À travers les TIC',
        commission: 'Pr Communication',
        niveauArabe: 'BON'
      }
    }),
    prisma.member.create({
      data: {
        nom: 'Cissé',
        prenom: 'Aminata',
        telephone: '221703456789',
        email: 'aminata@example.com',
        adresse: 'Saint-Louis, Sénégal',
        profession: 'Médecin',
        genre: 'FEMME',
        dateNaissance: new Date('1988-12-03'),
        numeroAdhesion: 'DH018',
        situationMatrimoniale: 'Célibataire',
        dateAdhesion: new Date('2023-03-05'),
        decouverteDahira: 'Via un membre',
        commission: 'Secrétaire General',
        niveauArabe: 'EXCELLENT'
      }
    }),
    prisma.member.create({
      data: {
        nom: 'Cissé',
        prenom: 'Amadou',
        telephone: '221704567890',
        email: 'amadou@example.com',
        adresse: 'Kaolack, Sénégal',
        profession: 'Commerçant',
        genre: 'HOMME',
        dateNaissance: new Date('1982-03-12'),
        numeroAdhesion: 'DH017',
        situationMatrimoniale: 'Marié',
        dateAdhesion: new Date('2023-04-20'),
        decouverteDahira: 'À travers les TIC',
        commission: 'Pr Communication',
        niveauArabe: 'DEBUTANT'
      }
    }),
    prisma.member.create({
      data: {
        nom: 'Ba',
        prenom: 'Ousmane',
        telephone: '221705678901',
        email: 'ousmane@example.com',
        adresse: 'Ziguinchor, Sénégal',
        profession: 'Avocat',
        genre: 'HOMME',
        dateNaissance: new Date('1987-07-25'),
        numeroAdhesion: 'DH016',
        situationMatrimoniale: 'Marié',
        dateAdhesion: new Date('2023-05-15'),
        decouverteDahira: 'Via un membre',
        commission: 'Secrétaire General',
        niveauArabe: 'BON'
      }
    }),
    prisma.member.create({
      data: {
        nom: 'Sow',
        prenom: 'Mamadou',
        telephone: '221706789012',
        email: 'mamadou@example.com',
        adresse: 'Touba, Sénégal',
        profession: 'Imam',
        genre: 'HOMME',
        dateNaissance: new Date('1975-11-08'),
        numeroAdhesion: 'DH015',
        situationMatrimoniale: 'Marié',
        dateAdhesion: new Date('2023-06-01'),
        decouverteDahira: 'Via un membre',
        commission: 'Pr Communication',
        niveauArabe: 'EXCELLENT'
      }
    })
  ]);

  console.log(`✅ ${members.length} membres créés`);

  // Obtenir le jeudi de cette semaine
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToThursday = dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;
  const thisThursday = new Date(today);
  thisThursday.setDate(today.getDate() + daysToThursday);
  thisThursday.setHours(0, 0, 0, 0);

  console.log('📅 Jeudi de cette semaine:', thisThursday.toISOString().split('T')[0]);

  // Créer des cotisations de test pour cette semaine
  const cotisations = await Promise.all([
    // Quelques cotisations payées
    prisma.cotisation.create({
      data: {
        memberId: members[0].id,
        montant: 250,
        semaine: thisThursday,
        statut: 'PAYE',
        type: 'HEBDOMADAIRE'
      }
    }),
    prisma.cotisation.create({
      data: {
        memberId: members[1].id,
        montant: 250,
        semaine: thisThursday,
        statut: 'PAYE',
        type: 'HEBDOMADAIRE'
      }
    }),
    // Une cotisation en attente
    prisma.cotisation.create({
      data: {
        memberId: members[2].id,
        montant: 250,
        semaine: thisThursday,
        statut: 'EN_ATTENTE',
        type: 'HEBDOMADAIRE'
      }
    }),
    // Une cotisation événement
    prisma.cotisation.create({
      data: {
        memberId: members[3].id,
        montant: 5000,
        semaine: thisThursday,
        statut: 'PAYE',
        type: 'EVENEMENT',
        evenementType: 'MARIAGE',
        description: 'Mariage de Fatou et Mamadou'
      }
    })
  ]);

  console.log(`✅ ${cotisations.length} cotisations créées pour le ${thisThursday.toISOString().split('T')[0]}`);

  console.log('🎉 Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

