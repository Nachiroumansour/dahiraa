const prisma = require('../utils/prisma');

// Fonction utilitaire pour obtenir le jeudi d'une semaine
const getThursdayOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -3 : 4); // Ajuster au jeudi
  return new Date(d.setDate(diff));
};

// Fonction utilitaire pour obtenir le premier jeudi du mois
const getFirstThursdayOfMonth = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  const daysToAdd = dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;
  return new Date(year, month, 1 + daysToAdd);
};

const createCotisation = async (req, res) => {
  try {
    const { 
      memberId, 
      montant = 250, 
      semaine, 
      statut = 'PAYE', 
      type = 'HEBDOMADAIRE',
      evenementType,
      description
    } = req.body;

    if (!memberId || !semaine) {
      return res.status(400).json({ error: 'Membre et semaine requis' });
    }

    // Vérifier si le membre existe
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    // Vérifier si une cotisation existe déjà pour cette semaine (seulement pour les cotisations hebdomadaires)
    if (type === 'HEBDOMADAIRE') {
    const existingCotisation = await prisma.cotisation.findFirst({
      where: {
        memberId,
          semaine: new Date(semaine),
          type: 'HEBDOMADAIRE'
      }
    });

    if (existingCotisation) {
        return res.status(400).json({ error: 'Une cotisation hebdomadaire existe déjà pour cette semaine' });
      }
    }

    const cotisation = await prisma.cotisation.create({
      data: {
        memberId,
        montant: parseFloat(montant),
        semaine: new Date(semaine),
        statut,
        type,
        evenementType: type === 'EVENEMENT' ? evenementType : null,
        description: type === 'EVENEMENT' ? description : null
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

    res.status(201).json({
      message: 'Cotisation enregistrée avec succès',
      cotisation
    });
  } catch (error) {
    console.error('Erreur lors de la création de la cotisation:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getCotisations = async (req, res) => {
  try {
    const { page = 1, limit = 10, semaine, memberId, statut, type, mois, annee } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (semaine) {
      where.semaine = new Date(semaine);
    }
    
    if (memberId) {
      where.memberId = memberId;
    }
    
    if (statut) {
      where.statut = statut;
    }
    
    if (type) {
      where.type = type;
    }
    
    // Filtre par mois/année
    if (mois && annee) {
      const startDate = new Date(parseInt(annee), parseInt(mois) - 1, 1);
      const endDate = new Date(parseInt(annee), parseInt(mois), 0);
      where.semaine = {
        gte: startDate,
        lte: endDate
      };
    }

    const [cotisations, total] = await Promise.all([
      prisma.cotisation.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { semaine: 'desc' },
        include: {
          member: {
            select: {
              id: true,
              prenom: true,
              nom: true,
              numeroAdhesion: true,
              telephone: true
            }
          }
        }
      }),
      prisma.cotisation.count({ where })
    ]);

    res.json({
      cotisations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cotisations:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const updateCotisation = async (req, res) => {
  try {
    const { id } = req.params;
    const { montant, statut, type, evenementType, description } = req.body;

    const cotisation = await prisma.cotisation.findUnique({
      where: { id }
    });

    if (!cotisation) {
      return res.status(404).json({ error: 'Cotisation non trouvée' });
    }

    const updateData = {};
    if (montant !== undefined) {
      updateData.montant = parseFloat(montant);
    }
    if (statut !== undefined) {
      updateData.statut = statut;
    }
    if (type !== undefined) {
      updateData.type = type;
    }
    if (evenementType !== undefined) {
      updateData.evenementType = type === 'EVENEMENT' ? evenementType : null;
    }
    if (description !== undefined) {
      updateData.description = type === 'EVENEMENT' ? description : null;
    }

    const updatedCotisation = await prisma.cotisation.update({
      where: { id },
      data: updateData,
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

    res.json({
      message: 'Cotisation mise à jour avec succès',
      cotisation: updatedCotisation
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la cotisation:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const deleteCotisation = async (req, res) => {
  try {
    const { id } = req.params;

    const cotisation = await prisma.cotisation.findUnique({
      where: { id }
    });

    if (!cotisation) {
      return res.status(404).json({ error: 'Cotisation non trouvée' });
    }

    await prisma.cotisation.delete({
      where: { id }
    });

    res.json({ message: 'Cotisation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la cotisation:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getCotisationsByWeek = async (req, res) => {
  try {
    const { semaine } = req.params;
    const semaineDate = new Date(semaine);

    console.log('📅 API: Recherche des cotisations pour la semaine:', semaine);
    console.log('📅 API: Date parsée:', semaineDate);

    // Récupérer tous les membres
    const members = await prisma.member.findMany({
      select: {
        id: true,
        prenom: true,
        nom: true,
        numeroAdhesion: true,
        telephone: true
      },
      orderBy: { nom: 'asc' }
    });

    console.log('👥 API: Membres trouvés:', members.length);

    // Récupérer les cotisations pour cette semaine (tous types)
    const cotisations = await prisma.cotisation.findMany({
      where: { 
        semaine: semaineDate
      },
      include: {
        member: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            numeroAdhesion: true
          }
        }
      }
    });

    console.log('💰 API: Cotisations trouvées:', cotisations.length);
    console.log('💰 API: Détails des cotisations:', cotisations.map(c => ({
      id: c.id,
      memberId: c.memberId,
      montant: c.montant,
      statut: c.statut,
      type: c.type,
      semaine: c.semaine
    })));

    // Calculer les statistiques
    const totalMontant = cotisations.reduce((sum, c) => sum + c.montant, 0);
    const nombrePaye = cotisations.filter(c => c.statut === 'PAYE').length;
    const nombreEnAttente = cotisations.filter(c => c.statut === 'EN_ATTENTE').length;

    console.log('📊 API: Statistiques calculées:', {
      totalMontant,
      nombrePaye,
      nombreEnAttente,
      totalCotisations: cotisations.length
    });

    res.json({
      semaine: semaineDate.toISOString().split('T')[0],
      report: cotisations,
      stats: {
        total: members.length,
        payes: nombrePaye,
        enAttente: nombreEnAttente,
        montantTotal: totalMontant
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du rapport hebdomadaire:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// Nouvelle fonction : Rapport mensuel
const getMonthlyReport = async (req, res) => {
  try {
    const { mois, annee } = req.params;
    
    // Validation des paramètres
    if (!mois || !annee) {
      return res.status(400).json({ error: 'Mois et année requis' });
    }
    
    const month = parseInt(mois);
    const year = parseInt(annee);

    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ error: 'Mois et année doivent être des nombres valides' });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({ error: 'Mois invalide (doit être entre 1 et 12)' });
    }

    if (year < 2020 || year > 2030) {
      return res.status(400).json({ error: 'Année invalide' });
    }

    // Obtenir le premier jeudi du mois
    const firstThursday = getFirstThursdayOfMonth(year, month - 1);
    
    // Calculer tous les jeudis du mois
    const jeudis = [];
    let currentThursday = new Date(firstThursday);
    
    while (currentThursday.getMonth() === month - 1) {
      jeudis.push(new Date(currentThursday));
      currentThursday.setDate(currentThursday.getDate() + 7);
    }

    // Récupérer tous les membres
    const members = await prisma.member.findMany({
      select: {
        id: true,
        prenom: true,
        nom: true,
        numeroAdhesion: true,
        telephone: true
      },
      orderBy: { nom: 'asc' }
    });

    // Récupérer toutes les cotisations du mois
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999); // Fin du mois
    
    const cotisations = await prisma.cotisation.findMany({
      where: {
        semaine: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        type: 'HEBDOMADAIRE'
      },
      include: {
        member: {
          select: {
            prenom: true,
            nom: true,
            numeroAdhesion: true
          }
        }
      },
      orderBy: { semaine: 'asc' }
    });

    // Calculer les statistiques par membre
    const nombreJeudis = jeudis.length; // Définir nombreJeudis ici
    const memberStats = members.map(member => {
      const memberCotisations = cotisations.filter(c => c.memberId === member.id);
      const totalCotise = memberCotisations.reduce((sum, c) => sum + parseFloat(c.montant || 0), 0);
      const montantAttendu = nombreJeudis * 250; // 250 FCFA par jeudi
      const reste = montantAttendu - totalCotise;
      const tauxParticipation = nombreJeudis > 0 ? (memberCotisations.length / nombreJeudis) * 100 : 0;

      return {
        member,
        totalCotise,
        montantAttendu,
        reste,
        nombreCotisations: memberCotisations.length,
        nombreJeudis,
        tauxParticipation: Math.round(tauxParticipation * 100) / 100, // Arrondir à 2 décimales
        cotisations: memberCotisations
      };
    });

    // Calculer les statistiques globales
    const totalMembers = members.length;
    const totalCotise = memberStats.reduce((sum, stat) => sum + stat.totalCotise, 0);
    const totalAttendu = memberStats.reduce((sum, stat) => sum + stat.montantAttendu, 0);
    const totalRestes = memberStats.reduce((sum, stat) => sum + Math.max(0, stat.reste), 0);
    const membresEnRetard = memberStats.filter(stat => stat.reste > 0).length;
    const totalCotisations = memberStats.reduce((sum, stat) => sum + stat.nombreCotisations, 0);
    const tauxParticipationGlobal = totalMembers > 0 && nombreJeudis > 0 ? 
      (totalCotisations / (totalMembers * nombreJeudis)) * 100 : 0;

    // Statistiques par semaine
    const weeklyStats = jeudis.map(jeudi => {
      const cotisationsSemaine = cotisations.filter(c => {
        const cotisationDate = new Date(c.semaine);
        const jeudiDate = new Date(jeudi);
        return cotisationDate.toISOString().split('T')[0] === jeudiDate.toISOString().split('T')[0];
      });
      
      return {
        date: jeudi.toISOString().split('T')[0],
        nombreCotisations: cotisationsSemaine.length,
        totalMontant: cotisationsSemaine.reduce((sum, c) => sum + parseFloat(c.montant || 0), 0),
        tauxParticipation: totalMembers > 0 ? Math.round((cotisationsSemaine.length / totalMembers) * 100 * 100) / 100 : 0
      };
    });

    res.json({
      mois,
      annee,
      nombreJeudis,
      totalMembers,
      totalCotise,
      totalAttendu,
      totalRestes,
      membresEnRetard,
      tauxParticipationGlobal: Math.round(tauxParticipationGlobal * 100) / 100,
      memberStats,
      weeklyStats,
      jeudis: jeudis.map(j => j.toISOString().split('T')[0])
    });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport mensuel:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erreur interne du serveur lors de la génération du rapport mensuel',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Nouvelle fonction : Bilan annuel
const getYearlyReport = async (req, res) => {
  try {
    const { annee } = req.params;
    const year = parseInt(annee);

    // Récupérer tous les membres
    const members = await prisma.member.findMany({
      select: {
        id: true,
        prenom: true,
        nom: true,
        numeroAdhesion: true
      },
      orderBy: { nom: 'asc' }
    });

    // Récupérer toutes les cotisations de l'année
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const cotisations = await prisma.cotisation.findMany({
      where: {
        semaine: {
          gte: startDate,
          lte: endDate
        },
        type: 'HEBDOMADAIRE'
      },
      include: {
        member: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            numeroAdhesion: true
          }
        }
      }
    });

    // Calculer les statistiques par mois
    const monthlyStats = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      
      const monthCotisations = cotisations.filter(c => 
        c.semaine >= monthStart && c.semaine <= monthEnd
      );
      
      // Calculer le nombre de jeudis dans ce mois
      const firstThursday = getFirstThursdayOfMonth(year, month);
      let thursdaysCount = 0;
      let currentThursday = new Date(firstThursday);
      
      while (currentThursday.getMonth() === month) {
        thursdaysCount++;
        currentThursday.setDate(currentThursday.getDate() + 7);
      }

      const monthTotal = monthCotisations.reduce((sum, c) => sum + c.montant, 0);
      const monthExpected = members.length * thursdaysCount * 250;

      monthlyStats.push({
        mois: month + 1,
        nomMois: new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'long' }),
        totalCotise: monthTotal,
        totalAttendu: monthExpected,
        tauxParticipation: monthExpected > 0 ? (monthTotal / monthExpected) * 100 : 0,
        nombreJeudis: thursdaysCount
      });
    }

    // Statistiques par membre
    const memberStats = members.map(member => {
      const memberCotisations = cotisations.filter(c => c.memberId === member.id);
      const totalPaye = memberCotisations.filter(c => c.statut === 'PAYE').reduce((sum, c) => sum + c.montant, 0);
      const totalEnAttente = memberCotisations.filter(c => c.statut === 'EN_ATTENTE').reduce((sum, c) => sum + c.montant, 0);
      
      return {
        member,
        totalPaye,
        totalEnAttente,
        totalCotise: totalPaye + totalEnAttente,
        nombreCotisations: memberCotisations.length
      };
    });

    // Statistiques globales de l'année
    const totalCotise = cotisations.reduce((sum, c) => sum + c.montant, 0);
    const totalPaye = cotisations.filter(c => c.statut === 'PAYE').reduce((sum, c) => sum + c.montant, 0);
    const totalEnAttente = cotisations.filter(c => c.statut === 'EN_ATTENTE').reduce((sum, c) => sum + c.montant, 0);

    res.json({
      annee: year,
      stats: {
        totalMembres: members.length,
        totalCotise,
        totalPaye,
        totalEnAttente,
        moyenneParMembre: members.length > 0 ? totalCotise / members.length : 0
      },
      monthlyStats,
      memberStats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du bilan annuel:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const bulkCreateCotisations = async (req, res) => {
  try {
    const { semaine, cotisations, type = 'HEBDOMADAIRE' } = req.body;

    if (!semaine || !Array.isArray(cotisations) || cotisations.length === 0) {
      return res.status(400).json({ error: 'Semaine et liste des cotisations requises' });
    }

    const semaineDate = new Date(semaine);
    const results = [];
    const errors = [];

    for (const cotisationData of cotisations) {
      try {
        const { memberId, montant = 250, statut = 'PAYE' } = cotisationData;

        // Vérifier si une cotisation existe déjà
        const existing = await prisma.cotisation.findFirst({
          where: {
            memberId,
            semaine: semaineDate,
            type
          }
        });

        if (existing) {
          // Mettre à jour si elle existe
          const updated = await prisma.cotisation.update({
            where: { id: existing.id },
            data: {
              montant: parseFloat(montant),
              statut
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
          results.push({ action: 'updated', cotisation: updated });
        } else {
          // Créer une nouvelle cotisation
          const created = await prisma.cotisation.create({
            data: {
              memberId,
              montant: parseFloat(montant),
              semaine: semaineDate,
              statut,
              type
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
          results.push({ action: 'created', cotisation: created });
        }
      } catch (error) {
        errors.push({
          memberId: cotisationData.memberId,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Cotisations traitées avec succès',
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Erreur lors de la création en masse des cotisations:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getRestesAPayer = async (req, res) => {
  try {
    const { mois, annee } = req.query;
    const currentDate = new Date();
    const currentMonth = mois ? parseInt(mois) : currentDate.getMonth() + 1;
    const currentYear = annee ? parseInt(annee) : currentDate.getFullYear();

    // Obtenir le premier jeudi du mois
    const firstThursday = getFirstThursdayOfMonth(currentYear, currentMonth - 1);
    
    // Calculer tous les jeudis du mois
    const jeudis = [];
    let currentThursday = new Date(firstThursday);
    
    while (currentThursday.getMonth() === currentMonth - 1) {
      jeudis.push(new Date(currentThursday));
      currentThursday.setDate(currentThursday.getDate() + 7);
    }

    // Récupérer tous les membres
    const members = await prisma.member.findMany({
      select: {
        id: true,
        prenom: true,
        nom: true,
        numeroAdhesion: true,
        telephone: true
      },
      orderBy: { nom: 'asc' }
    });

    // Récupérer toutes les cotisations du mois
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    
    const cotisations = await prisma.cotisation.findMany({
      where: {
        semaine: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        type: 'HEBDOMADAIRE'
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

    // Calculer les restes à payer par membre
    const restesAPayer = members.map(member => {
      const memberCotisations = cotisations.filter(c => c.memberId === member.id);
      const totalCotise = memberCotisations.reduce((sum, c) => sum + c.montant, 0);
      const nombreJeudis = jeudis.length;
      const montantAttendu = nombreJeudis * 250; // 250 FCFA par jeudi
      const reste = montantAttendu - totalCotise;
      const tauxParticipation = nombreJeudis > 0 ? (memberCotisations.length / nombreJeudis) * 100 : 0;

      return {
        member,
        totalCotise,
        montantAttendu,
        reste: Math.max(0, reste),
        nombreCotisations: memberCotisations.length,
        nombreJeudis,
        tauxParticipation,
        aDesRestes: reste > 0
      };
    }).filter(item => item.aDesRestes) // Filtrer seulement ceux qui ont des restes
    .sort((a, b) => b.reste - a.reste); // Trier par reste décroissant

    // Statistiques globales
    const totalRestes = restesAPayer.reduce((sum, item) => sum + item.reste, 0);
    const nombreMembresEnRetard = restesAPayer.length;

    res.json({
      mois: currentMonth,
      annee: currentYear,
      nombreJeudis,
      totalRestes,
      nombreMembresEnRetard,
      restesAPayer
    });
  } catch (error) {
    console.error('Erreur lors du calcul des restes à payer:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// Nouvelle route : restes à payer sur une période personnalisée
const getRestesAPayerPeriode = async (req, res) => {
  try {
    const { dateDebut, dateFin, memberId } = req.query;
    if (!dateDebut || !dateFin) {
      return res.status(400).json({ error: 'dateDebut et dateFin sont requis' });
    }
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    if (isNaN(debut) || isNaN(fin)) {
      return res.status(400).json({ error: 'Dates invalides' });
    }
    // 1. Calculer tous les jeudis entre dateDebut et dateFin
    const jeudis = [];
    let d = new Date(debut);
    // Aller au premier jeudi >= dateDebut
    d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7));
    while (d <= fin) {
      jeudis.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
    // 2. Récupérer les membres
    const memberWhere = memberId ? { id: memberId } : {};
    const members = await prisma.member.findMany({
      where: memberWhere,
      select: {
        id: true,
        prenom: true,
        nom: true,
        numeroAdhesion: true,
        telephone: true
      },
      orderBy: { nom: 'asc' }
    });
    // 3. Récupérer toutes les cotisations hebdomadaires sur la période
    const cotisations = await prisma.cotisation.findMany({
      where: {
        semaine: { gte: debut, lte: fin },
        type: 'HEBDOMADAIRE',
        ...(memberId && { memberId })
      }
    });
    // 4. Calculer pour chaque membre
    const montantHebdo = 250;
    const result = members.map(member => {
      const cotisMembre = cotisations.filter(c => c.memberId === member.id && c.statut === 'PAYE');
      const montantPaye = cotisMembre.reduce((sum, c) => sum + c.montant, 0);
      const montantAttendu = jeudis.length * montantHebdo;
      const reste = montantAttendu - montantPaye;
      return {
        member,
        montantAttendu,
        montantPaye,
        reste: Math.max(0, reste),
        nombreJeudis: jeudis.length,
        cotisationsPayees: cotisMembre.length
      };
    });
    // 5. Statistiques globales
    const totalRestes = result.reduce((sum, r) => sum + r.reste, 0);
    res.json({
      dateDebut,
      dateFin,
      nombreJeudis: jeudis.length,
      totalRestes,
      membres: result
    });
  } catch (error) {
    console.error('Erreur lors du calcul des restes à payer sur période:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// Nouvelle fonction : Historique des cotisations par membre
const getMemberCotisationHistory = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { page = 1, limit = 10, type, statut, dateDebut, dateFin } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Vérifier si le membre existe
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        prenom: true,
        nom: true,
        numeroAdhesion: true,
        telephone: true,
        email: true,
        photoProfile: true
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    // Construire les filtres
    const where = {
      memberId: memberId
    };

    if (type) {
      where.type = type;
    }

    if (statut) {
      where.statut = statut;
    }

    if (dateDebut || dateFin) {
      where.semaine = {};
      if (dateDebut) {
        where.semaine.gte = new Date(dateDebut);
      }
      if (dateFin) {
        where.semaine.lte = new Date(dateFin);
      }
    }

    // Récupérer les cotisations avec pagination
    const cotisations = await prisma.cotisation.findMany({
      where,
      include: {
        member: {
          select: {
            prenom: true,
            nom: true,
            numeroAdhesion: true
          }
        }
      },
      orderBy: { semaine: 'desc' },
      skip,
      take: parseInt(limit)
    });

    // Compter le total pour la pagination
    const total = await prisma.cotisation.count({ where });

    // Calculer les statistiques
    const allCotisations = await prisma.cotisation.findMany({
      where: { memberId: memberId },
      orderBy: { semaine: 'desc' }
    });

    const totalCotise = allCotisations.reduce((sum, c) => sum + parseFloat(c.montant || 0), 0);
    const totalCotisations = allCotisations.length;
    const cotisationsPayees = allCotisations.filter(c => c.statut === 'PAYE').length;
    const cotisationsEnAttente = allCotisations.filter(c => c.statut === 'EN_ATTENTE').length;
    const cotisationsEnRetard = allCotisations.filter(c => c.statut === 'EN_RETARD').length;

    // Statistiques par type
    const statsParType = {
      HEBDOMADAIRE: allCotisations.filter(c => c.type === 'HEBDOMADAIRE').length,
      EVENEMENT: allCotisations.filter(c => c.type === 'EVENEMENT').length
    };

    // Statistiques par mois (12 derniers mois)
    const statsParMois = [];
    const maintenant = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const moisSuivant = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      
      const cotisationsMois = allCotisations.filter(c => {
        const cotisationDate = new Date(c.semaine);
        return cotisationDate >= date && cotisationDate < moisSuivant;
      });

      const totalMois = cotisationsMois.reduce((sum, c) => sum + parseFloat(c.montant || 0), 0);

      statsParMois.push({
        mois: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        nombreCotisations: cotisationsMois.length,
        totalMontant: totalMois
      });
    }

    res.json({
      member,
      cotisations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      statistiques: {
        totalCotise,
        totalCotisations,
        cotisationsPayees,
        cotisationsEnAttente,
        cotisationsEnRetard,
        statsParType,
        statsParMois
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des cotisations:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erreur interne du serveur lors de la récupération de l\'historique',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createCotisation,
  getCotisations,
  updateCotisation,
  deleteCotisation,
  getCotisationsByWeek,
  getMonthlyReport,
  getYearlyReport,
  bulkCreateCotisations,
  getRestesAPayer,
  getRestesAPayerPeriode,
  getMemberCotisationHistory
};

