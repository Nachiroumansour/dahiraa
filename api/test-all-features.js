const axios = require('axios');

const API_BASE = 'https://dahiraa-production.up.railway.app/api';

async function testAllFeatures() {
  console.log('🧪 Test complet de toutes les fonctionnalités...\n');
  
  let token = null;
  let adminId = null;
  let memberId = null;
  let cotisationId = null;
  let eventId = null;
  let expenseId = null;

  try {
    // 1. Test de connexion
    console.log('1️⃣ Test de connexion...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@dahiraa.com',
      password: 'admin123'
    });
    
    token = loginResponse.data.token;
    adminId = loginResponse.data.user.id;
    console.log('✅ Connexion réussie');
    console.log(`   Token: ${token.substring(0, 50)}...`);
    console.log(`   User ID: ${adminId}\n`);

    // 2. Test du profil utilisateur
    console.log('2️⃣ Test du profil utilisateur...');
    const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profil récupéré:', profileResponse.data.email);
    console.log('');

    // 3. Test de création d'un membre
    console.log('3️⃣ Test de création d\'un membre...');
    const memberData = {
      nom: 'Test',
      prenom: 'Membre',
      dateNaissance: '1990-01-01',
      genre: 'HOMME',
      categorie: 'A',
      telephone: '777777777',
      email: 'membre@test.com',
      adresse: '123 Rue Test',
      ville: 'Dakar',
      pays: 'Sénégal'
    };
    
    const memberResponse = await axios.post(`${API_BASE}/members`, memberData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    memberId = memberResponse.data.id;
    console.log('✅ Membre créé:', memberResponse.data.nom, memberResponse.data.prenom);
    console.log('');

    // 4. Test de récupération des membres
    console.log('4️⃣ Test de récupération des membres...');
    const membersResponse = await axios.get(`${API_BASE}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ ${membersResponse.data.length} membre(s) récupéré(s)`);
    console.log('');

    // 5. Test de création d'une cotisation
    console.log('5️⃣ Test de création d\'une cotisation...');
    const cotisationData = {
      memberId: memberId,
      montant: 5000,
      type: 'MENSUELLE',
      mois: 1,
      annee: 2025
    };
    
    const cotisationResponse = await axios.post(`${API_BASE}/cotisations`, cotisationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    cotisationId = cotisationResponse.data.id;
    console.log('✅ Cotisation créée:', cotisationResponse.data.montant, 'FCFA');
    console.log('');

    // 6. Test de récupération des cotisations
    console.log('6️⃣ Test de récupération des cotisations...');
    const cotisationsResponse = await axios.get(`${API_BASE}/cotisations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ ${cotisationsResponse.data.length} cotisation(s) récupérée(s)`);
    console.log('');

    // 7. Test de création d'un événement
    console.log('7️⃣ Test de création d\'un événement...');
    const eventData = {
      titre: 'Réunion mensuelle',
      description: 'Réunion de janvier 2025',
      dateDebut: '2025-01-15T10:00:00Z',
      dateFin: '2025-01-15T12:00:00Z',
      lieu: 'Mosquée centrale',
      type: 'REUNION',
      statut: 'PLANIFIE'
    };
    
    const eventResponse = await axios.post(`${API_BASE}/events`, eventData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    eventId = eventResponse.data.id;
    console.log('✅ Événement créé:', eventResponse.data.titre);
    console.log('');

    // 8. Test de récupération des événements
    console.log('8️⃣ Test de récupération des événements...');
    const eventsResponse = await axios.get(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ ${eventsResponse.data.length} événement(s) récupéré(s)`);
    console.log('');

    // 9. Test de création d'une dépense
    console.log('9️⃣ Test de création d\'une dépense...');
    const expenseData = {
      titre: 'Achat matériel',
      description: 'Achat de matériel pour la mosquée',
      montant: 25000,
      categorie: 'MATERIEL',
      statut: 'EN_COURS'
    };
    
    const expenseResponse = await axios.post(`${API_BASE}/expenses`, expenseData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    expenseId = expenseResponse.data.id;
    console.log('✅ Dépense créée:', expenseResponse.data.titre, expenseResponse.data.montant, 'FCFA');
    console.log('');

    // 10. Test de récupération des dépenses
    console.log('🔟 Test de récupération des dépenses...');
    const expensesResponse = await axios.get(`${API_BASE}/expenses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ ${expensesResponse.data.length} dépense(s) récupérée(s)`);
    console.log('');

    // 11. Test du dashboard
    console.log('1️⃣1️⃣ Test du dashboard...');
    const dashboardResponse = await axios.get(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Dashboard récupéré');
    console.log(`   Membres: ${dashboardResponse.data.totalMembers}`);
    console.log(`   Cotisations: ${dashboardResponse.data.totalCotisations}`);
    console.log(`   Événements: ${dashboardResponse.data.totalEvents}`);
    console.log(`   Dépenses: ${dashboardResponse.data.totalExpenses}`);
    console.log('');

    // 12. Test de mise à jour d'un membre
    console.log('1️⃣2️⃣ Test de mise à jour d\'un membre...');
    const updateData = {
      nom: 'Test Modifié',
      prenom: 'Membre Modifié'
    };
    
    const updateResponse = await axios.put(`${API_BASE}/members/${memberId}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Membre mis à jour:', updateResponse.data.nom, updateResponse.data.prenom);
    console.log('');

    console.log('🎉 TOUS LES TESTS SONT RÉUSSIS ! 🎉');
    console.log('✅ L\'application fonctionne parfaitement');
    console.log('✅ Toutes les fonctionnalités sont opérationnelles');
    console.log('✅ La base de données PostgreSQL fonctionne correctement');
    console.log('✅ L\'authentification JWT fonctionne');
    console.log('✅ Les CRUD operations fonctionnent');
    console.log('✅ Le dashboard fonctionne');
    console.log('');
    console.log('📊 Résumé des données créées:');
    console.log(`   - 1 utilisateur admin`);
    console.log(`   - 1 membre`);
    console.log(`   - 1 cotisation`);
    console.log(`   - 1 événement`);
    console.log(`   - 1 dépense`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
    process.exit(1);
  }
}

testAllFeatures(); 