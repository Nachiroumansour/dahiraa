const prisma = require('../utils/prisma');

const createEvent = async (req, res) => {
  try {
    const {
      titre,
      lieu,
      dateDebut,
      dateFin,
      montantContribution,
      description,
      participantIds = []
    } = req.body;

    if (!titre || !lieu || !dateDebut || !dateFin || !montantContribution) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    // Créer l'événement
    const event = await prisma.event.create({
      data: {
        titre,
        lieu,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        montantContribution: parseFloat(montantContribution),
        description
      }
    });

    // Ajouter les participants si fournis
    if (participantIds.length > 0) {
      const participations = participantIds.map(memberId => ({
        eventId: event.id,
        memberId,
        statut: 'EN_ATTENTE'
      }));

      await prisma.eventParticipation.createMany({
        data: participations
      });
    }

    // Récupérer l'événement avec les participants
    const eventWithParticipants = await prisma.event.findUnique({
      where: { id: event.id },
      include: {
        participants: {
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
        },
        _count: {
          select: {
            participants: true,
            depenses: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Événement créé avec succès',
      event: eventWithParticipants
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, upcoming, past } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    const now = new Date();

    if (upcoming === 'true') {
      where.dateDebut = { gte: now };
    } else if (past === 'true') {
      where.dateFin = { lt: now };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { dateDebut: 'desc' },
        include: {
          _count: {
            select: {
              participants: true,
              depenses: true
            }
          }
        }
      }),
      prisma.event.count({ where })
    ]);

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
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
          },
          orderBy: { createdAt: 'asc' }
        },
        depenses: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    // Calculer les statistiques
    const stats = {
      totalParticipants: event.participants.length,
      totalPaye: event.participants.reduce((sum, p) => sum + p.montantPaye, 0),
      totalAttendu: event.participants.length * event.montantContribution,
      totalDepenses: event.depenses.reduce((sum, d) => sum + d.montant, 0),
      participantsPayes: event.participants.filter(p => p.statut === 'PAYE').length,
      participantsEnAttente: event.participants.filter(p => p.statut === 'EN_ATTENTE').length
    };

    stats.solde = stats.totalPaye - stats.totalDepenses;

    res.json({
      event,
      stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    // Convertir les dates si fournies
    if (updateData.dateDebut) {
      updateData.dateDebut = new Date(updateData.dateDebut);
    }
    if (updateData.dateFin) {
      updateData.dateFin = new Date(updateData.dateFin);
    }
    if (updateData.montantContribution) {
      updateData.montantContribution = parseFloat(updateData.montantContribution);
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        participants: {
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
        },
        _count: {
          select: {
            participants: true,
            depenses: true
          }
        }
      }
    });

    res.json({
      message: 'Événement mis à jour avec succès',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    await prisma.event.delete({
      where: { id }
    });

    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const addParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ error: 'ID du membre requis' });
    }

    // Vérifier si l'événement existe
    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    // Vérifier si le membre existe
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    // Vérifier si le membre participe déjà
    const existingParticipation = await prisma.eventParticipation.findUnique({
      where: {
        eventId_memberId: {
          eventId: id,
          memberId
        }
      }
    });

    if (existingParticipation) {
      return res.status(400).json({ error: 'Ce membre participe déjà à l\'événement' });
    }

    const participation = await prisma.eventParticipation.create({
      data: {
        eventId: id,
        memberId,
        statut: 'EN_ATTENTE'
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

    res.status(201).json({
      message: 'Participant ajouté avec succès',
      participation
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du participant:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const updateParticipation = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { montantPaye, statut } = req.body;

    const participation = await prisma.eventParticipation.findUnique({
      where: {
        eventId_memberId: {
          eventId: id,
          memberId
        }
      }
    });

    if (!participation) {
      return res.status(404).json({ error: 'Participation non trouvée' });
    }

    const updateData = {};
    if (montantPaye !== undefined) {
      updateData.montantPaye = parseFloat(montantPaye);
    }
    if (statut !== undefined) {
      updateData.statut = statut;
    }

    const updatedParticipation = await prisma.eventParticipation.update({
      where: {
        eventId_memberId: {
          eventId: id,
          memberId
        }
      },
      data: updateData,
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

    res.json({
      message: 'Participation mise à jour avec succès',
      participation: updatedParticipation
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la participation:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const removeParticipant = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const participation = await prisma.eventParticipation.findUnique({
      where: {
        eventId_memberId: {
          eventId: id,
          memberId
        }
      }
    });

    if (!participation) {
      return res.status(404).json({ error: 'Participation non trouvée' });
    }

    await prisma.eventParticipation.delete({
      where: {
        eventId_memberId: {
          eventId: id,
          memberId
        }
      }
    });

    res.json({ message: 'Participant retiré avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du participant:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addParticipant,
  updateParticipation,
  removeParticipant
};

