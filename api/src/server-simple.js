const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://dahiraa-app.vercel.app',
  'https://dahiraa-client.vercel.app',
  'https://dahiraa.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Database connection
const dbPath = process.env.DATABASE_URL || 'prisma/dev.db';
const db = new sqlite3.Database(dbPath);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  db.get('SELECT * FROM "User" WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error('Erreur base de données:', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    try {
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Erreur bcrypt:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, role = 'ADMIN' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Erreur hashage:', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    const userId = require('crypto').randomUUID();
    
    db.run(
      'INSERT INTO "User" (id, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [userId, email, hashedPassword, role],
      function(err) {
        if (err) {
          console.error('Erreur insertion:', err);
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Cet email existe déjà' });
          }
          return res.status(500).json({ error: 'Erreur interne du serveur' });
        }

        res.status(201).json({
          message: 'Utilisateur créé avec succès',
          user: { id: userId, email, role }
        });
      }
    );
  });
});

// Members routes
app.get('/api/members', authenticateToken, (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  db.all('SELECT * FROM "Member" LIMIT ? OFFSET ?', [limit, offset], (err, members) => {
    if (err) {
      console.error('Erreur récupération membres:', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    db.get('SELECT COUNT(*) as total FROM "Member"', (err, result) => {
      if (err) {
        console.error('Erreur comptage membres:', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }

      res.json({
        members,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    });
  });
});

app.post('/api/members', authenticateToken, (req, res) => {
  const memberData = req.body;
  const memberId = require('crypto').randomUUID();

  const sql = `
    INSERT INTO "Member" (
      id, nom, prenom, dateNaissance, lieuNaissance, adresse, telephone, 
      email, profession, dateAdhesion, numeroAdherent, statut, photo, 
      commission, niveauArabe, categorie, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  const values = [
    memberId, memberData.nom, memberData.prenom, memberData.dateNaissance,
    memberData.lieuNaissance, memberData.adresse, memberData.telephone,
    memberData.email, memberData.profession, memberData.dateAdhesion,
    memberData.numeroAdherent, memberData.statut || 'ACTIF', memberData.photo,
    memberData.commission, memberData.niveauArabe, memberData.categorie
  ];

  db.run(sql, values, function(err) {
    if (err) {
      console.error('Erreur création membre:', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    res.status(201).json({
      message: 'Membre créé avec succès',
      member: { id: memberId, ...memberData }
    });
  });
});

// Cotisations routes
app.get('/api/cotisations', authenticateToken, (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  db.all('SELECT * FROM "Cotisation" LIMIT ? OFFSET ?', [limit, offset], (err, cotisations) => {
    if (err) {
      console.error('Erreur récupération cotisations:', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    db.get('SELECT COUNT(*) as total FROM "Cotisation"', (err, result) => {
      if (err) {
        console.error('Erreur comptage cotisations:', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }

      res.json({
        cotisations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    });
  });
});

app.post('/api/cotisations', authenticateToken, (req, res) => {
  const cotisationData = req.body;
  const cotisationId = require('crypto').randomUUID();

  const sql = `
    INSERT INTO "Cotisation" (
      id, memberId, montant, datePaiement, type, mois, annee, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  const values = [
    cotisationId, cotisationData.memberId, cotisationData.montant,
    cotisationData.datePaiement, cotisationData.type || 'MENSUELLE',
    cotisationData.mois, cotisationData.annee
  ];

  db.run(sql, values, function(err) {
    if (err) {
      console.error('Erreur création cotisation:', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }

    res.status(201).json({
      message: 'Cotisation créée avec succès',
      cotisation: { id: cotisationId, ...cotisationData }
    });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Initialize database if needed
async function initializeDatabase() {
  try {
    console.log('🔧 Initialisation de la base de données...');
    
    // Use the setup script
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync('node setup-db.js');
      console.log('✅ Base de données initialisée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error.message);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  }
}

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  
  // Initialize database
  await initializeDatabase();
});

module.exports = app;

