const prisma = require('../utils/prisma');

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi de cette semaine

    // Statistiques générales
    const [
      totalMembers,
      totalCotisationsThisMonth,
      totalExpensesThisMonth,
      upcomingEvents,
      recentCotisations,
      membersWithoutRecentCotisation
    ] = await Promise.all([
      // Nombre total de membres
      prisma.member.count(),

      // Total des cotisations ce mois
      prisma.cotisation.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          statut: 'PAYE'
        },
        _sum: { montant: true },
        _count: true
      }),

      // Total des dépenses ce mois
      prisma.expense.aggregate({
        where: {
          date: { gte: startOfMonth }
        },
        _sum: { montant: true },
        _count: true
      }),

      // Événements à venir
      prisma.event.findMany({
        where: {
          dateDebut: { gte: now }
        },
        orderBy: { dateDebut: 'asc' },
        take: 3,
        include: {
          _count: {
            select: { participants: true }
          }
        }
      }),

      // Cotisations récentes
      prisma.cotisation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          member: {
            select: {
              prenom: true,
              nom: true,
              numeroAdhesion: true
            }
          }
        }
      }),

      // Membres sans cotisation récente (plus de 2 semaines)
      prisma.member.findMany({
        where: {
          cotisations: {
            none: {
              createdAt: {
                gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
              }
            }
          }
        },
        select: {
          id: true,
          prenom: true,
          nom: true,
          numeroAdhesion: true,
          telephone: true
        },
        take: 10
      })
    ]);

    // Calcul du solde total en caisse
    const [totalCotisations, totalExpenses] = await Promise.all([
      prisma.cotisation.aggregate({
        where: { statut: 'PAYE' },
        _sum: { montant: true }
      }),
      prisma.expense.aggregate({
        _sum: { montant: true }
      })
    ]);

    const soldeTotal = (totalCotisations._sum.montant || 0) - (totalExpenses._sum.montant || 0);

    // Données pour les graphiques - Évolution des cotisations vs dépenses (toutes les données disponibles)
    const sixMonthsAgo = new Date('2020-01-01'); // Inclure toutes les données

    // Version SQLite simplifiée
    const cotisationsData = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', date(createdAt)) as month,
        SUM(CASE WHEN statut = 'PAYE' THEN montant ELSE 0 END) as cotisations
      FROM cotisations 
      WHERE createdAt >= ${sixMonthsAgo.toISOString()}
      GROUP BY strftime('%Y-%m', date(createdAt))
      ORDER BY month
    `;

    const expensesData = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', date(date)) as month,
        SUM(montant) as expenses
      FROM expenses 
      WHERE date >= ${sixMonthsAgo.toISOString()}
      GROUP BY strftime('%Y-%m', date(date))
      ORDER BY month
    `;

    // Combiner les données
    const monthlyMap = new Map();
    
    // Ajouter les cotisations
    cotisationsData.forEach(item => {
      monthlyMap.set(item.month, {
        month: item.month,
        cotisations: Number(item.cotisations) || 0,
        expenses: 0
      });
    });
    
    // Ajouter les dépenses
    expensesData.forEach(item => {
      if (monthlyMap.has(item.month)) {
        monthlyMap.get(item.month).expenses = Number(item.expenses) || 0;
      } else {
        monthlyMap.set(item.month, {
          month: item.month,
          cotisations: 0,
          expenses: Number(item.expenses) || 0
        });
      }
    });
    
    const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    
    // Si pas de données, générer des données de test pour les graphiques
    if (monthlyData.length === 0) {
      const currentDate = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        monthlyData.push({
          month: date.toISOString().slice(0, 7), // Format YYYY-MM
          cotisations: Math.floor(Math.random() * 50000) + 10000,
          expenses: Math.floor(Math.random() * 20000) + 5000
        });
      }
    }

    // Répartition des dépenses par type
    const expensesByType = await prisma.expense.groupBy({
      by: ['type'],
      _sum: { montant: true },
      _count: true
    });

    // Statistiques des événements actifs
    const activeEvents = await prisma.event.findMany({
      where: {
        OR: [
          { dateDebut: { gte: now } },
          { 
            AND: [
              { dateDebut: { lte: now } },
              { dateFin: { gte: now } }
            ]
          }
        ]
      },
      include: {
        participants: {
          include: {
            member: {
              select: {
                prenom: true,
                nom: true
              }
            }
          }
        },
        _count: {
          select: {
            participants: true,
            depenses: true
          }
        }
      }
    });

    const dashboardData = {
      summary: {
        totalMembers,
        soldeTotal,
        cotisationsThisMonth: {
          montant: totalCotisationsThisMonth._sum.montant || 0,
          count: totalCotisationsThisMonth._count
        },
        expensesThisMonth: {
          montant: totalExpensesThisMonth._sum.montant || 0,
          count: totalExpensesThisMonth._count
        }
      },
      upcomingEvents,
      recentCotisations,
      membersWithoutRecentCotisation,
      charts: {
        monthlyTrend: monthlyData,
        expensesByType: expensesByType.map(item => ({
          type: item.type,
          montant: item._sum.montant,
          count: item._count
        }))
      },
      activeEvents: activeEvents.map(event => {
        const totalPaye = event.participants.reduce((sum, p) => sum + p.montantPaye, 0);
        const totalAttendu = event.participants.length * event.montantContribution;
        
        return {
          ...event,
          stats: {
            totalParticipants: event.participants.length,
            totalPaye,
            totalAttendu,
            pourcentagePaye: totalAttendu > 0 ? (totalPaye / totalAttendu) * 100 : 0
          }
        };
      })
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données du tableau de bord:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const expenseWhere = {};
    if (startDate || endDate) {
      expenseWhere.date = {};
      if (startDate) {
        expenseWhere.date.gte = new Date(startDate);
      }
      if (endDate) {
        expenseWhere.date.lte = new Date(endDate);
      }
    }

    const [cotisationsStats, expensesStats] = await Promise.all([
      prisma.cotisation.aggregate({
        where: { ...where, statut: 'PAYE' },
        _sum: { montant: true },
        _count: true,
        _avg: { montant: true }
      }),
      prisma.expense.aggregate({
        where: expenseWhere,
        _sum: { montant: true },
        _count: true,
        _avg: { montant: true }
      })
    ]);

    const totalCotisations = cotisationsStats._sum.montant || 0;
    const totalExpenses = expensesStats._sum.montant || 0;
    const solde = totalCotisations - totalExpenses;

    const summary = {
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      cotisations: {
        total: totalCotisations,
        count: cotisationsStats._count,
        moyenne: cotisationsStats._avg.montant || 0
      },
      expenses: {
        total: totalExpenses,
        count: expensesStats._count,
        moyenne: expensesStats._avg.montant || 0
      },
      solde,
      ratio: totalCotisations > 0 ? (totalExpenses / totalCotisations) * 100 : 0
    };

    res.json({ summary });
  } catch (error) {
    console.error('Erreur lors de la récupération du résumé financier:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getWeeklyReport = async (req, res) => {
  try {
    const { week } = req.query;
    const targetDate = week ? new Date(week) : new Date();
    
    // Calculer le début et la fin de la semaine (lundi à dimanche)
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - targetDate.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Récupérer les cotisations de la semaine
    const cotisations = await prisma.cotisation.findMany({
      where: {
        semaine: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      include: {
        member: {
          select: {
            prenom: true,
            nom: true,
            numeroAdhesion: true
          }
        }
      }
    });

    // Récupérer les dépenses de la semaine
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      include: {
        event: {
          select: {
            titre: true
          }
        }
      }
    });

    // Calculer les statistiques
    const totalCotisations = cotisations.reduce((sum, c) => sum + c.montant, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.montant, 0);
    const soldeWeek = totalCotisations - totalExpenses;

    const report = {
      period: {
        startOfWeek,
        endOfWeek,
        weekNumber: Math.ceil((targetDate.getDate() - 1) / 7) + 1
      },
      cotisations: {
        list: cotisations,
        total: totalCotisations,
        count: cotisations.length,
        byStatus: {
          paye: cotisations.filter(c => c.statut === 'PAYE').length,
          enAttente: cotisations.filter(c => c.statut === 'EN_ATTENTE').length,
          absent: cotisations.filter(c => c.statut === 'ABSENT').length
        }
      },
      expenses: {
        list: expenses,
        total: totalExpenses,
        count: expenses.length
      },
      solde: soldeWeek
    };

    res.json({ report });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport hebdomadaire:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

module.exports = {
  getDashboardStats,
  getFinancialSummary,
  getWeeklyReport
};

