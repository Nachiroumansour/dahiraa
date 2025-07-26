const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Serveur minimal fonctionnel'
  });
});

// Test route with parameter
app.get('/api/test/:id', (req, res) => {
  res.json({ 
    message: 'Route avec paramètre',
    id: req.params.id
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur minimal démarré sur le port ${PORT}`);
});

module.exports = app;

