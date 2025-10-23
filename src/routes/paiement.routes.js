const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { traiterPaiement, getPaiement } = require('../controllers/paiement.controller');

/**
 * @openapi
 * tags:
 *   - name: Paiements
 *     description: Traitement et consultation des paiements
 */
/**
 * @openapi
 * /api/paiements:
 *   post:
 *     summary: Traiter un paiement
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *               - methode
 *             properties:
 *               reservationId:
 *                 type: string
 *                 example: "66fa01f7a1b2c3d4e5f67890"
 *               methode:
 *                 type: string
 *                 enum: [WAVE, OM, CARD]
 *                 example: WAVE
 *               detailsMethode:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       201:
 *         description: Paiement traité
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 */
router.post('/', protect, traiterPaiement);
/**
 * @openapi
 * /api/paiements/{ref}:
 *   get:
 *     summary: Obtenir un paiement par référence
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ref
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du paiement
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Non trouvé
 */
router.get('/:ref', protect, getPaiement);

module.exports = router;
