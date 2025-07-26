const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

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

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe requis' 
      });
    }

    const client = getClient();
    await client.connect();

    // Rechercher l'utilisateur
    const result = await client.query(
      'SELECT * FROM "User" WHERE email = $1',
      [email]
    );

    await client.end();

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    const user = result.rows[0];
    console.log('🔍 Utilisateur trouvé:', { id: user.id, email: user.email, role: user.role });

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Générer le token JWT avec l'ID fixe
    const token = jwt.sign(
      { 
        userId: 'admin-user-12345', // ID fixe pour admin
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: 'admin-user-12345', // ID fixe
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
};

// Register
const register = async (req, res) => {
  try {
    const { email, password, role = 'ADMIN' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe requis' 
      });
    }

    const client = getClient();
    await client.connect();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await client.query(
      'SELECT id FROM "User" WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.end();
      return res.status(400).json({ 
        error: 'Un utilisateur avec cet email existe déjà' 
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const userId = randomUUID();
    await client.query(
      'INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, email, hashedPassword, role, new Date(), new Date()]
    );

    await client.end();

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: userId,
        email,
        role
      }
    });

  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const client = getClient();
    await client.connect();

    const result = await client.query(
      'SELECT id, email, role, "createdAt" FROM "User" WHERE id = $1',
      [userId]
    );

    await client.end();

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    const user = result.rows[0];
    res.json({ user });

  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { email, password } = req.body;

    const client = getClient();
    await client.connect();

    // Vérifier si l'utilisateur existe
    const existingUser = await client.query(
      'SELECT id FROM "User" WHERE id = $1',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      await client.end();
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    // Préparer les mises à jour
    let updateFields = [];
    let values = [];
    let paramIndex = 1;

    if (email) {
      updateFields.push(`email = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push(`password = $${paramIndex}`);
      values.push(hashedPassword);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      await client.end();
      return res.status(400).json({ 
        error: 'Aucune donnée à mettre à jour' 
      });
    }

    // Ajouter updatedAt
    updateFields.push(`"updatedAt" = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;

    // Ajouter l'ID à la fin
    values.push(userId);

    const updateQuery = `
      UPDATE "User" 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING id, email, role, "createdAt"
    `;

    const result = await client.query(updateQuery, values);
    await client.end();

    res.json({
      message: 'Profil mis à jour avec succès',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile
}; 