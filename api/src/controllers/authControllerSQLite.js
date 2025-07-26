const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

// Database connection
const dbPath = process.env.DATABASE_URL || 'prisma/dev.db';
const db = new sqlite3.Database(dbPath);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const login = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, role = 'ADMIN' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Erreur hashage:', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }

      const userId = randomUUID();
      
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
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.userId,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

module.exports = {
  login,
  register,
  getProfile
}; 