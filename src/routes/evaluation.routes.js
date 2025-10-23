const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createEvaluation, getEvaluationsChauffeur } = require('../controllers/evaluation.controller');

/**
 * @openapi
 * tags:
 *   - name: Evaluations
 *     description: Gestion des évaluations des chauffeurs
 */
/**
 * @openapi
 * /api/evaluations:
 *   post:
 *     summary: Créer une évaluation (CLIENT)
 *     tags: [Evaluations]
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
 *               - note
 *             properties:
 *               reservationId:
 *                 type: string
 *                 example: "66fa01f7a1b2c3d4e5f67890"
 *               note:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               commentaire:
 *                 type: string
 *                 example: "Très bon chauffeur, trajet agréable."
 *               criteres:
 *                 type: object
 *                 additionalProperties:
 *                   type: integer
 *                 example:
 *                   ponctualite: 5
 *                   confort: 4
 *                   securite: 5
 *     responses:
 *       201:
 *         description: Évaluation créée
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 */
router.post('/', protect, authorize('CLIENT'), createEvaluation);
/**
 * @openapi
 * /api/evaluations/chauffeur/{chauffeurId}:
 *   get:
 *     summary: Lister les évaluations d'un chauffeur
 *     tags: [Evaluations]
 *     parameters:
 *       - in: path
 *         name: chauffeurId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des évaluations
 */
router.get('/chauffeur/:chauffeurId', getEvaluationsChauffeur);

module.exports = router;
