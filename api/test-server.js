const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de base
app.use(cors());
app.use(express.json());

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Serveur de test fonctionnel'
  });
});

// Test Prisma
app.get('/api/test-prisma', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test simple de connexion
    const userCount = await prisma.user.count();
    await prisma.$disconnect();
    
    res.json({ 
      status: 'OK', 
      message: 'Prisma fonctionne',
      userCount 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: error.message 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur de test démarré sur le port ${PORT}`);
});

