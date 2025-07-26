const express = require('express');
const {
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
} = require('../controllers/cotisationController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Cotisation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         memberId:
 *           type: string
 *         montant:
 *           type: number
 *         semaine:
 *           type: string
 *           format: date
 *         statut:
 *           type: string
 *           enum: [PAYE, EN_ATTENTE, ABSENT]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         member:
 *           type: object
 *           properties:
 *             prenom:
 *               type: string
 *             nom:
 *               type: string
 *             numeroAdhesion:
 *               type: string
 *     CotisationCreate:
 *       type: object
 *       required:
 *         - memberId
 *         - montant
 *         - semaine
 *       properties:
 *         memberId:
 *           type: string
 *         montant:
 *           type: number
 *         semaine:
 *           type: string
 *           format: date
 *         statut:
 *           type: string
 *           enum: [PAYE, EN_ATTENTE, ABSENT]
 *           default: PAYE
 */

/**
 * @swagger
 * /cotisations:
 *   post:
 *     summary: Enregistrer une nouvelle cotisation
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CotisationCreate'
 *     responses:
 *       201:
 *         description: Cotisation enregistrée avec succès
 *       400:
 *         description: Erreur de validation
 */
router.post('/', createCotisation);

/**
 * @swagger
 * /cotisations:
 *   get:
 *     summary: Récupérer la liste des cotisations
 *     tags: [Cotisations]
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
 *         name: semaine
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [PAYE, EN_ATTENTE, ABSENT]
 *     responses:
 *       200:
 *         description: Liste des cotisations
 */
router.get('/', getCotisations);

/**
 * @swagger
 * /cotisations/bulk:
 *   post:
 *     summary: Enregistrer plusieurs cotisations en une fois
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - semaine
 *               - cotisations
 *             properties:
 *               semaine:
 *                 type: string
 *                 format: date
 *               cotisations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     memberId:
 *                       type: string
 *                     montant:
 *                       type: number
 *                     statut:
 *                       type: string
 *                       enum: [PAYE, EN_ATTENTE, ABSENT]
 *     responses:
 *       200:
 *         description: Cotisations traitées avec succès
 */
router.post('/bulk', bulkCreateCotisations);

/**
 * @swagger
 * /cotisations/week/{semaine}:
 *   get:
 *     summary: Récupérer le rapport des cotisations pour une semaine
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: semaine
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de la semaine (format YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Rapport hebdomadaire des cotisations
 */
router.get('/week/:semaine', getCotisationsByWeek);

/**
 * @swagger
 * /cotisations/monthly-report/{mois}/{annee}:
 *   get:
 *     summary: Récupérer le rapport mensuel des cotisations
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mois
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mois (1-12)
 *       - in: path
 *         name: annee
 *         required: true
 *         schema:
 *           type: integer
 *         description: Année
 *     responses:
 *       200:
 *         description: Rapport mensuel des cotisations
 */
router.get('/monthly-report/:mois/:annee', getMonthlyReport);

/**
 * @swagger
 * /cotisations/yearly-report/{annee}:
 *   get:
 *     summary: Récupérer le rapport annuel des cotisations
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: annee
 *         required: true
 *         schema:
 *           type: integer
 *         description: Année
 *     responses:
 *       200:
 *         description: Rapport annuel des cotisations
 */
router.get('/yearly-report/:annee', getYearlyReport);

/**
 * @swagger
 * /cotisations/restes-a-payer:
 *   get:
 *     summary: Récupérer la liste des cotisations restantes à payer
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des cotisations restantes à payer
 */
router.get('/restes-a-payer', requireRole(['ADMIN', 'GESTIONNAIRE']), getRestesAPayer);

/**
 * @swagger
 * /cotisations/restes-a-payer-periode:
 *   get:
 *     summary: Récupérer les restes à payer sur une période personnalisée
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateDebut
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (YYYY-MM-DD)
 *       - in: query
 *         name: dateFin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (YYYY-MM-DD)
 *       - in: query
 *         name: memberId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID du membre (optionnel)
 *     responses:
 *       200:
 *         description: Liste des restes à payer sur la période
 */
router.get('/restes-a-payer-periode', requireRole(['ADMIN', 'GESTIONNAIRE']), getRestesAPayerPeriode);

/**
 * @swagger
 * /cotisations/history/{memberId}:
 *   get:
 *     summary: Récupérer l'historique des cotisations d'un membre
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du membre
 *     responses:
 *       200:
 *         description: Historique des cotisations du membre
 */
router.get('/history/:memberId', requireRole(['ADMIN', 'GESTIONNAIRE']), getMemberCotisationHistory);

/**
 * @swagger
 * /cotisations/{id}:
 *   put:
 *     summary: Mettre à jour une cotisation
 *     tags: [Cotisations]
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
 *             properties:
 *               montant:
 *                 type: number
 *               statut:
 *                 type: string
 *                 enum: [PAYE, EN_ATTENTE, ABSENT]
 *     responses:
 *       200:
 *         description: Cotisation mise à jour avec succès
 *       404:
 *         description: Cotisation non trouvée
 */
router.put('/:id', updateCotisation);

/**
 * @swagger
 * /cotisations/{id}:
 *   delete:
 *     summary: Supprimer une cotisation
 *     tags: [Cotisations]
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
 *         description: Cotisation supprimée avec succès
 *       404:
 *         description: Cotisation non trouvée
 */
router.delete('/:id', requireRole(['ADMIN']), deleteCotisation);

module.exports = router;

