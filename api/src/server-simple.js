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

