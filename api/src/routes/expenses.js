const express = require('express');
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats
} = require('../controllers/expenseController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         montant:
 *           type: number
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [EVENEMENT, GENERALE]
 *         eventId:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         justificatif:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         event:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             titre:
 *               type: string
 *             dateDebut:
 *               type: string
 *               format: date-time
 *     ExpenseCreate:
 *       type: object
 *       required:
 *         - montant
 *         - description
 *         - type
 *       properties:
 *         montant:
 *           type: number
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [EVENEMENT, GENERALE]
 *         eventId:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Enregistrer une nouvelle dépense
 *     tags: [Dépenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ExpenseCreate'
 *               - type: object
 *                 properties:
 *                   justificatif:
 *                     type: string
 *                     format: binary
 *     responses:
 *       201:
 *         description: Dépense enregistrée avec succès
 *       400:
 *         description: Erreur de validation
 */
router.post('/', upload.single('justificatif'), handleUploadError, createExpense);

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Récupérer la liste des dépenses
 *     tags: [Dépenses]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [EVENEMENT, GENERALE]
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des dépenses
 */
router.get('/', getExpenses);

/**
 * @swagger
 * /expenses/stats:
 *   get:
 *     summary: Récupérer les statistiques des dépenses
 *     tags: [Dépenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistiques des dépenses
 */
router.get('/stats', getExpenseStats);

/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     summary: Récupérer une dépense par ID
 *     tags: [Dépenses]
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
 *         description: Détails de la dépense
 *       404:
 *         description: Dépense non trouvée
 */
router.get('/:id', getExpenseById);

/**
 * @swagger
 * /expenses/{id}:
 *   put:
 *     summary: Mettre à jour une dépense
 *     tags: [Dépenses]
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
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ExpenseCreate'
 *               - type: object
 *                 properties:
 *                   justificatif:
 *                     type: string
 *                     format: binary
 *     responses:
 *       200:
 *         description: Dépense mise à jour avec succès
 *       404:
 *         description: Dépense non trouvée
 */
router.put('/:id', upload.single('justificatif'), handleUploadError, updateExpense);

/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     summary: Supprimer une dépense
 *     tags: [Dépenses]
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
 *         description: Dépense supprimée avec succès
 *       404:
 *         description: Dépense non trouvée
 */
router.delete('/:id', requireRole(['ADMIN']), deleteExpense);

module.exports = router;

