const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('crypto');

// Database connection
const dbPath = process.env.DATABASE_URL || 'prisma/dev.db';
const db = new sqlite3.Database(dbPath);

const createMember = async (req, res) => {
  try {
    const {
      nom, prenom, telephone, email, adresse, adresseComplement, profession, 
      genre, dateNaissance, situationMatrimoniale, decouverteDahira, 
      commission, niveauArabe, categorie, antecedentsMedicaux, allergies, 
      traitements, contactUrgenceTel, typeAutorite, contactUrgenceNom, 
      contactUrgencePrenom, contactUrgenceTelephone, numeroAdhesion
    } = req.body;

    // Validation des champs requis
    if (!prenom || !nom || !genre || !dateNaissance || !telephone || !adresse || !numeroAdhesion) {
      return res.status(400).json({ 
        error: 'Les champs nom, prénom, genre, date de naissance, téléphone, adresse et numéro d\'adhésion sont obligatoires' 
      });
    }

    const memberId = uuidv4();

    const sql = `
      INSERT INTO "Member" (
        id, nom, prenom, telephone, email, adresse, adresseComplement, profession, 
        genre, dateNaissance, situationMatrimoniale, decouverteDahira, commission, 
        niveauArabe, categorie, antecedentsMedicaux, allergies, traitements, 
        contactUrgenceTel, typeAutorite, contactUrgenceNom, contactUrgencePrenom, 
        contactUrgenceTelephone, numeroAdhesion, statut, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    const values = [
      memberId, nom, prenom, telephone, email || null, adresse, adresseComplement || null,
      profession || null, genre, dateNaissance, situationMatrimoniale || null, 
      decouverteDahira || null, commission || null, niveauArabe || null, categorie || null,
      antecedentsMedicaux || null, allergies || null, traitements || null, 
      contactUrgenceTel || null, typeAutorite || null, contactUrgenceNom || null,
      contactUrgencePrenom || null, contactUrgenceTelephone || null, numeroAdhesion
    ];

    db.run(sql, values, function(err) {
      if (err) {
        console.error('Erreur création membre:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Ce numéro de téléphone ou d\'adhésion est déjà utilisé' });
        }
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }

      res.status(201).json({
        message: 'Membre créé avec succès',
        member: {
          id: memberId,
          nom, prenom, telephone, email, adresse, profession, genre, 
          dateNaissance, numeroAdhesion, statut: 'ACTIF'
        }
      });
    });
  } catch (error) {
    console.error('Erreur création membre:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', statut = '', commission = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (search) {
      whereClause += ' AND (nom LIKE ? OR prenom LIKE ? OR telephone LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (statut) {
      whereClause += ' AND statut = ?';
      params.push(statut);
    }

    if (commission) {
      whereClause += ' AND commission = ?';
      params.push(commission);
    }

    const sql = `SELECT * FROM "Member" ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    const countSql = `SELECT COUNT(*) as total FROM "Member" ${whereClause}`;

    db.all(sql, [...params, limit, offset], (err, members) => {
      if (err) {
        console.error('Erreur récupération membres:', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }

      db.get(countSql, params, (err, result) => {
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
  } catch (error) {
    console.error('Erreur récupération membres:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    db.get('SELECT * FROM "Member" WHERE id = ?', [id], (err, member) => {
      if (err) {
        console.error('Erreur récupération membre:', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }

      if (!member) {
        return res.status(404).json({ error: 'Membre non trouvé' });
      }

      res.json({ member });
    });
  } catch (error) {
    console.error('Erreur récupération membre:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier si le membre existe
    db.get('SELECT * FROM "Member" WHERE id = ?', [id], (err, member) => {
      if (err) {
        console.error('Erreur vérification membre:', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }

      if (!member) {
        return res.status(404).json({ error: 'Membre non trouvé' });
      }

      // Construire la requête de mise à jour
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);

      const sql = `UPDATE "Member" SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;

      db.run(sql, values, function(err) {
        if (err) {
          console.error('Erreur mise à jour membre:', err);
          return res.status(500).json({ error: 'Erreur interne du serveur' });
        }

        res.json({
          message: 'Membre mis à jour avec succès',
          member: { id, ...updateData }
        });
      });
    });
  } catch (error) {
    console.error('Erreur mise à jour membre:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    db.run('DELETE FROM "Member" WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Erreur suppression membre:', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Membre non trouvé' });
      }

      res.json({ message: 'Membre supprimé avec succès' });
    });
  } catch (error) {
    console.error('Erreur suppression membre:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getMemberStats = async (req, res) => {
  try {
    db.get('SELECT COUNT(*) as total FROM "Member"', (err, totalResult) => {
      if (err) {
        console.error('Erreur statistiques membres:', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }

      db.get('SELECT COUNT(*) as actifs FROM "Member" WHERE statut = "ACTIF"', (err, actifsResult) => {
        if (err) {
          console.error('Erreur statistiques membres actifs:', err);
          return res.status(500).json({ error: 'Erreur interne du serveur' });
        }

        res.json({
          total: totalResult.total,
          actifs: actifsResult.actifs,
          inactifs: totalResult.total - actifsResult.actifs
        });
      });
    });
  } catch (error) {
    console.error('Erreur statistiques membres:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  getMemberStats
}; 