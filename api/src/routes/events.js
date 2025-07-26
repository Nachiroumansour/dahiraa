const express = require('express');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addParticipant,
  updateParticipation,
  removeParticipant
} = require('../controllers/eventController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         titre:
 *           type: string
 *         lieu:
 *           type: string
 *         dateDebut:
 *           type: string
 *           format: date-time
 *         dateFin:
 *           type: string
 *           format: date-time
 *         montantContribution:
 *           type: number
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     EventCreate:
 *       type: object
 *       required:
 *         - titre
 *         - lieu
 *         - dateDebut
 *         - dateFin
 *         - montantContribution
 *       properties:
 *         titre:
 *           type: string
 *         lieu:
 *           type: string
 *         dateDebut:
 *           type: string
 *           format: date-time
 *         dateFin:
 *           type: string
 *           format: date-time
 *         montantContribution:
 *           type: number
 *         description:
 *           type: string
 *         participantIds:
 *           type: array
 *           items:
 *             type: string
 *     EventParticipation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         eventId:
 *           type: string
 *         memberId:
 *           type: string
 *         montantPaye:
 *           type: number
 *         statut:
 *           type: string
 *           enum: [PAYE, EN_ATTENTE]
 *         member:
 *           type: object
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Créer un nouvel événement
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreate'
 *     responses:
 *       201:
 *         description: Événement créé avec succès
 *       400:
 *         description: Erreur de validation
 */
router.post('/', createEvent);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Récupérer la liste des événements
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Filtrer les événements à venir
 *       - in: query
 *         name: past
 *         schema:
 *           type: boolean
 *         description: Filtrer les événements passés
 *     responses:
 *       200:
 *         description: Liste des événements
 */
router.get('/', getEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Récupérer un événement par ID
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'événement
 *       404:
 *         description: Événement non trouvé
 */
router.get('/:id', getEventById);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Mettre à jour un événement
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreate'
 *     responses:
 *       200:
 *         description: Événement mis à jour avec succès
 *       404:
 *         description: Événement non trouvé
 */
router.put('/:id', updateEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Supprimer un événement
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Événement supprimé avec succès
 *       404:
 *         description: Événement non trouvé
 */
router.delete('/:id', requireRole(['ADMIN']), deleteEvent);

/**
 * @swagger
 * /events/{id}/participants:
 *   post:
 *     summary: Ajouter un participant à un événement
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *             properties:
 *               memberId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Participant ajouté avec succès
 *       400:
 *         description: Erreur de validation
 */
router.post('/:id/participants', addParticipant);

/**
 * @swagger
 * /events/{id}/participants/{memberId}:
 *   put:
 *     summary: Mettre à jour la participation d'un membre
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               montantPaye:
 *                 type: number
 *               statut:
 *                 type: string
 *                 enum: [PAYE, EN_ATTENTE]
 *     responses:
 *       200:
 *         description: Participation mise à jour avec succès
 *       404:
 *         description: Participation non trouvée
 */
router.put('/:id/participants/:memberId', updateParticipation);

/**
 * @swagger
 * /events/{id}/participants/{memberId}:
 *   delete:
 *     summary: Retirer un participant d'un événement
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participant retiré avec succès
 *       404:
 *         description: Participation non trouvée
 */
router.delete('/:id/participants/:memberId', removeParticipant);

module.exports = router;

