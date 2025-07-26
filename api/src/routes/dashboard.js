const express = require('express');
const {
  getDashboardStats,
  getFinancialSummary,
  getWeeklyReport
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardStats:
 *       type: object
 *       properties:
 *         summary:
 *           type: object
 *           properties:
 *             totalMembers:
 *               type: integer
 *             soldeTotal:
 *               type: number
 *             cotisationsThisMonth:
 *               type: object
 *               properties:
 *                 montant:
 *                   type: number
 *                 count:
 *                   type: integer
 *             expensesThisMonth:
 *               type: object
 *               properties:
 *                 montant:
 *                   type: number
 *                 count:
 *                   type: integer
 *         upcomingEvents:
 *           type: array
 *           items:
 *             type: object
 *         recentCotisations:
 *           type: array
 *           items:
 *             type: object
 *         membersWithoutRecentCotisation:
 *           type: array
 *           items:
 *             type: object
 *         charts:
 *           type: object
 *           properties:
 *             monthlyTrend:
 *               type: array
 *               items:
 *                 type: object
 *             expensesByType:
 *               type: array
 *               items:
 *                 type: object
 *         activeEvents:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Récupérer les données du tableau de bord
 *     tags: [Tableau de bord]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du tableau de bord
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Non autorisé
 */
router.get('/', getDashboardStats);

/**
 * @swagger
 * /dashboard/financial-summary:
 *   get:
 *     summary: Récupérer le résumé financier
 *     tags: [Tableau de bord]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début pour le résumé financier
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin pour le résumé financier
 *     responses:
 *       200:
 *         description: Résumé financier
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           format: date
 *                         endDate:
 *                           type: string
 *                           format: date
 *                     cotisations:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         count:
 *                           type: integer
 *                         moyenne:
 *                           type: number
 *                     expenses:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         count:
 *                           type: integer
 *                         moyenne:
 *                           type: number
 *                     solde:
 *                       type: number
 *                     ratio:
 *                       type: number
 */
router.get('/financial-summary', getFinancialSummary);

/**
 * @swagger
 * /dashboard/weekly-report:
 *   get:
 *     summary: Récupérer le rapport hebdomadaire
 *     tags: [Tableau de bord]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de la semaine pour le rapport (format YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Rapport hebdomadaire
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: object
 *                       properties:
 *                         startOfWeek:
 *                           type: string
 *                           format: date-time
 *                         endOfWeek:
 *                           type: string
 *                           format: date-time
 *                         weekNumber:
 *                           type: integer
 *                     cotisations:
 *                       type: object
 *                       properties:
 *                         list:
 *                           type: array
 *                           items:
 *                             type: object
 *                         total:
 *                           type: number
 *                         count:
 *                           type: integer
 *                         byStatus:
 *                           type: object
 *                           properties:
 *                             paye:
 *                               type: integer
 *                             enAttente:
 *                               type: integer
 *                             absent:
 *                               type: integer
 *                     expenses:
 *                       type: object
 *                       properties:
 *                         list:
 *                           type: array
 *                           items:
 *                             type: object
 *                         total:
 *                           type: number
 *                         count:
 *                           type: integer
 *                     solde:
 *                       type: number
 */
router.get('/weekly-report', getWeeklyReport);

module.exports = router;

