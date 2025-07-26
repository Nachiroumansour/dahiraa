const express = require('express');
const {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  getMemberStats,
  exportMembersToExcel,
  exportMembersToPDF
} = require('../controllers/memberController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Member:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         prenom:
 *           type: string
 *         nom:
 *           type: string
 *         genre:
 *           type: string
 *           enum: [HOMME, FEMME]
 *         dateNaissance:
 *           type: string
 *           format: date
 *         telephone:
 *           type: string
 *         adresse:
 *           type: string
 *         numeroAdhesion:
 *           type: string
 *         groupeSanguin:
 *           type: string
 *         antecedentsMedicaux:
 *           type: string
 *         contactUrgenceNom:
 *           type: string
 *         contactUrgenceTel:
 *           type: string
 *         photoProfile:
 *           type: string
 *         dateInscription:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     MemberCreate:
 *       type: object
 *       required:
 *         - prenom
 *         - nom
 *         - genre
 *         - dateNaissance
 *         - telephone
 *         - adresse
 *         - numeroAdhesion
 *         - contactUrgenceNom
 *         - contactUrgenceTel
 *       properties:
 *         prenom:
 *           type: string
 *         nom:
 *           type: string
 *         genre:
 *           type: string
 *           enum: [HOMME, FEMME]
 *         dateNaissance:
 *           type: string
 *           format: date
 *         telephone:
 *           type: string
 *         adresse:
 *           type: string
 *         numeroAdhesion:
 *           type: string
 *         groupeSanguin:
 *           type: string
 *         antecedentsMedicaux:
 *           type: string
 *         contactUrgenceNom:
 *           type: string
 *         contactUrgenceTel:
 *           type: string
 */

/**
 * @swagger
 * /members:
 *   post:
 *     summary: Créer un nouveau membre
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/MemberCreate'
 *               - type: object
 *                 properties:
 *                   photoProfile:
 *                     type: string
 *                     format: binary
 *     responses:
 *       201:
 *         description: Membre créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 member:
 *                   $ref: '#/components/schemas/Member'
 *       400:
 *         description: Erreur de validation
 */
router.post('/', upload.single('photoProfile'), handleUploadError, createMember);

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Récupérer la liste des membres
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par nom, prénom, téléphone ou numéro d'adhésion
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           enum: [HOMME, FEMME]
 *         description: Filtrer par genre
 *     responses:
 *       200:
 *         description: Liste des membres
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Member'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', getMembers);

/**
 * @swagger
 * /members/stats:
 *   get:
 *     summary: Récupérer les statistiques globales des membres
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques globales des membres
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalMembers:
 *                   type: integer
 *                 genreStats:
 *                   type: array
 *                 commissionStats:
 *                   type: array
 *                 professionStats:
 *                   type: array
 *                 filterOptions:
 *                   type: object
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/stats', getMemberStats);

/**
 * @swagger
 * /members/{id}:
 *   get:
 *     summary: Récupérer un membre par ID
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du membre
 *     responses:
 *       200:
 *         description: Détails du membre
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 member:
 *                   $ref: '#/components/schemas/Member'
 *       404:
 *         description: Membre non trouvé
 */
router.get('/:id', getMemberById);

/**
 * @swagger
 * /members/{id}:
 *   put:
 *     summary: Mettre à jour un membre
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du membre
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/MemberCreate'
 *               - type: object
 *                 properties:
 *                   photoProfile:
 *                     type: string
 *                     format: binary
 *     responses:
 *       200:
 *         description: Membre mis à jour avec succès
 *       404:
 *         description: Membre non trouvé
 */
router.put('/:id', upload.single('photoProfile'), handleUploadError, updateMember);

/**
 * @swagger
 * /members/{id}:
 *   delete:
 *     summary: Supprimer un membre
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du membre
 *     responses:
 *       200:
 *         description: Membre supprimé avec succès
 *       404:
 *         description: Membre non trouvé
 */
router.delete('/:id', requireRole(['ADMIN']), deleteMember);

/**
 * @swagger
 * /members/{id}/stats:
 *   get:
 *     summary: Récupérer les statistiques d'un membre
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du membre
 *     responses:
 *       200:
 *         description: Statistiques du membre
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *       404:
 *         description: Membre non trouvé
 */
router.get('/:id/stats', getMemberStats);



module.exports = router;

