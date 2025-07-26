const { verifyToken } = require('../utils/jwt');
const { Client } = require('pg');

// Configuration de la base de données
function getClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL non définie');
  }

  return new Client({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });
}

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    const decoded = verifyToken(token);
    
    // Vérifier si l'utilisateur existe toujours avec PostgreSQL
    const client = getClient();
    await client.connect();

    const result = await client.query(
      'SELECT id, email, role FROM "User" WHERE id = $1',
      [decoded.userId]
    );

    await client.end();

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(403).json({ error: 'Token invalide' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
}; 