const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { setupSwagger } = require('./utils/swagger');
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const cotisationRoutes = require('./routes/cotisations');
const eventRoutes = require('./routes/events');
const expenseRoutes = require('./routes/expenses');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration (doit être avant helmet)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://dahiraa-app.vercel.app',
  'https://dahiraa-client.vercel.app',
  'https://dahiraa-client-git-main-nachiroumansour.vercel.app',
  'https://dahiraa-client-nachiroumansour.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origine (comme les applications mobiles)
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

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/cotisations', cotisationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Setup Swagger documentation
setupSwagger(app);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Erreur de validation', 
      details: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Non autorisé' 
    });
  }
  
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Initialize database if needed
async function initializeDatabase() {
  try {
    // Try Prisma first
    try {
      const { PrismaClient } = require('@prisma/client');
      const bcrypt = require('bcryptjs');
      const prisma = new PrismaClient();

      // Check if admin user exists
      const existingAdmin = await prisma.user.findUnique({
        where: { email: 'admin@dahiraa.com' }
      });

      if (!existingAdmin) {
        console.log('🔧 Initialisation de la base de données avec Prisma...');

        const hashedPassword = await bcrypt.hash('admin123', 10);

        await prisma.user.create({
          data: {
            email: 'admin@dahiraa.com',
            password: hashedPassword,
            role: 'ADMIN'
          }
        });

        await prisma.user.create({
          data: {
            email: 'test@dahiraa.com',
            password: hashedPassword,
            role: 'ADMIN'
          }
        });

        console.log('✅ Base de données initialisée avec succès !');
        console.log('📋 Identifiants: admin@dahiraa.com / admin123');
      }

      await prisma.$disconnect();
      return;
    } catch (prismaError) {
      console.log('⚠️ Prisma échoué, tentative avec PostgreSQL direct...');
      
      // Fallback to direct PostgreSQL
      const { Client } = require('pg');
      const bcrypt = require('bcryptjs');
      const { randomUUID } = require('crypto');
      
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL non définie');
      }

      const client = new Client({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false
        } : false
      });

      await client.connect();
      console.log('✅ Connecté à PostgreSQL');

      // Create tables if they don't exist
      const createTablesSQL = `
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'ADMIN',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        );
      `;

      await client.query(createTablesSQL);
      console.log('✅ Tables créées avec succès');

      // Check if users exist
      const existingUsers = await client.query('SELECT email FROM "User" WHERE email IN ($1, $2)', 
        ['admin@dahiraa.com', 'test@dahiraa.com']);

      const existingEmails = existingUsers.rows.map(row => row.email);

      if (!existingEmails.includes('admin@dahiraa.com')) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await client.query(
          'INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6)',
          [randomUUID(), 'admin@dahiraa.com', hashedPassword, 'ADMIN', new Date(), new Date()]
        );
        console.log('✅ Utilisateur admin@dahiraa.com créé');
      }

      if (!existingEmails.includes('test@dahiraa.com')) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await client.query(
          'INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6)',
          [randomUUID(), 'test@dahiraa.com', hashedPassword, 'ADMIN', new Date(), new Date()]
        );
        console.log('✅ Utilisateur test@dahiraa.com créé');
      }

      await client.end();
      console.log('🎉 Base de données PostgreSQL configurée avec succès !');
      console.log('📋 Identifiants: admin@dahiraa.com / admin123');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  }
}

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  
  // Initialize database
  await initializeDatabase();
});

module.exports = app;

