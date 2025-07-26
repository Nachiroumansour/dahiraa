const prisma = require('../utils/prisma');

const createExpense = async (req, res) => {
  try {
    const {
      montant,
      description,
      type,
      eventId,
      date
    } = req.body;

    if (!montant || !description || !type) {
      return res.status(400).json({ error: 'Montant, description et type requis' });
    }

    // Vérifier si l'événement existe si eventId est fourni
    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });

      if (!event) {
        return res.status(404).json({ error: 'Événement non trouvé' });
      }
    }

    // Gérer l'upload de justificatif
    let justificatif = null;
    if (req.file) {
      justificatif = `/uploads/justificatifs/${req.file.filename}`;
    }

    const expense = await prisma.expense.create({
      data: {
        montant: parseFloat(montant),
        description,
        type,
        eventId: eventId || null,
        date: date ? new Date(date) : new Date(),
        justificatif
      },
      include: {
        event: {
          select: {
            id: true,
            titre: true,
            dateDebut: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Dépense enregistrée avec succès',
      expense
    });
  } catch (error) {
    console.error('Erreur lors de la création de la dépense:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      eventId, 
      startDate, 
      endDate,
      search 
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (type) {
      where.type = type;
    }

    if (eventId) {
      where.eventId = eventId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { date: 'desc' },
        include: {
          event: {
            select: {
              id: true,
              titre: true,
              dateDebut: true
            }
          }
        }
      }),
      prisma.expense.count({ where })
    ]);

    res.json({
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des dépenses:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            titre: true,
            dateDebut: true,
            dateFin: true,
            lieu: true
          }
        }
      }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }

    res.json({ expense });
  } catch (error) {
    console.error('Erreur lors de la récupération de la dépense:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const expense = await prisma.expense.findUnique({
      where: { id }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }

    // Vérifier si l'événement existe si eventId est fourni
    if (updateData.eventId) {
      const event = await prisma.event.findUnique({
        where: { id: updateData.eventId }
      });

      if (!event) {
        return res.status(404).json({ error: 'Événement non trouvé' });
      }
    }

    // Gérer l'upload de nouveau justificatif
    if (req.file) {
      updateData.justificatif = `/uploads/justificatifs/${req.file.filename}`;
    }

    // Convertir les données
    if (updateData.montant) {
      updateData.montant = parseFloat(updateData.montant);
    }
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        event: {
          select: {
            id: true,
            titre: true,
            dateDebut: true
          }
        }
      }
    });

    res.json({
      message: 'Dépense mise à jour avec succès',
      expense: updatedExpense
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la dépense:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: { id }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }

    await prisma.expense.delete({
      where: { id }
    });

    res.json({ message: 'Dépense supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la dépense:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate, eventId } = req.query;

    const where = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (eventId) {
      where.eventId = eventId;
    }

    // Statistiques générales
    const totalStats = await prisma.expense.aggregate({
      where,
      _sum: { montant: true },
      _count: true,
      _avg: { montant: true }
    });

    // Répartition par type
    const typeStats = await prisma.expense.groupBy({
      by: ['type'],
      where,
      _sum: { montant: true },
      _count: true
    });

    // Répartition par événement (si pas de filtre eventId)
    let eventStats = [];
    if (!eventId) {
      eventStats = await prisma.expense.groupBy({
        by: ['eventId'],
        where: {
          ...where,
          eventId: { not: null }
        },
        _sum: { montant: true },
        _count: true
      });

      // Enrichir avec les détails des événements
      const eventIds = eventStats.map(stat => stat.eventId).filter(Boolean);
      if (eventIds.length > 0) {
        const events = await prisma.event.findMany({
          where: { id: { in: eventIds } },
          select: { id: true, titre: true }
        });

        const eventMap = new Map(events.map(e => [e.id, e]));
        eventStats = eventStats.map(stat => ({
          ...stat,
          event: eventMap.get(stat.eventId)
        }));
      }
    }

    // Évolution mensuelle
    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', date) as month,
        SUM(montant) as total,
        COUNT(*) as count
      FROM expenses
      ${where.date || where.eventId ? 'WHERE' : ''} 
      ${where.date?.gte ? `date >= ${where.date.gte}` : ''}
      ${where.date?.gte && where.date?.lte ? ' AND ' : ''}
      ${where.date?.lte ? `date <= ${where.date.lte}` : ''}
      ${where.eventId ? `${where.date ? ' AND ' : ''}event_id = ${where.eventId}` : ''}
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month DESC
      LIMIT 12
    `;

    const stats = {
      total: {
        montant: totalStats._sum.montant || 0,
        count: totalStats._count,
        moyenne: totalStats._avg.montant || 0
      },
      byType: typeStats.map(stat => ({
        type: stat.type,
        montant: stat._sum.montant,
        count: stat._count
      })),
      byEvent: eventStats,
      monthly: monthlyStats
    };

    res.json({ stats });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats
};

