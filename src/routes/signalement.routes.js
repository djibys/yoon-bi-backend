const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createSignalement, getMesSignalements } = require('../controllers/report.controller');

/**
 * @openapi
 * tags:
 *   - name: Signalements
 *     description: Gestion des signalements (Clients et Chauffeurs)
 */

/**
 * @openapi
 * /api/signalements:
 *   post:
 *     summary: Créer un nouveau signalement
 *     tags: [Signalements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - description
 *               - trajetId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [RETARD, ANNULATION, COMPORTEMENT, VEHICULE, TRAJET_MODIFIE, SECURITE, AUTRE]
 *                 example: RETARD
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Le chauffeur avait 30 minutes de retard sans prévenir
 *               trajetId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               reservationId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *     responses:
 *       201:
 *         description: Signalement créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Signalement créé avec succès
 *                 signalement:
 *                   type: object
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Trajet non trouvé
 */
router.post('/', protect, createSignalement);

/**
 * @openapi
 * /api/signalements/mes-signalements:
 *   get:
 *     summary: Récupérer mes signalements
 *     tags: [Signalements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de mes signalements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 signalements:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/mes-signalements', protect, getMesSignalements);

module.exports = router;
