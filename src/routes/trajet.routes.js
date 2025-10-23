const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  createTrajet, 
  getTrajets, 
  getTrajet,
  startTrajet, 
  addPosition, 
  endTrajet,
  getTrajetsChauffeur,
  deleteTrajet
} = require('../controllers/trajet.controller');

/**
 * @openapi
 * tags:
 *   - name: Trajets
 *     description: Gestion des trajets
 */

/**
 * @openapi
 * /api/trajets:
 *   get:
 *     summary: Lister les trajets
 *     tags: [Trajets]
 *     responses:
 *       200:
 *         description: Liste des trajets
 *   post:
 *     summary: Créer un trajet
 *     tags: [Trajets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - depart
 *               - arrivee
 *               - dateDebut
 *               - prixParPlace
 *               - nbPlacesDisponibles
 *             properties:
 *               depart:
 *                 type: string
 *                 example: "Dakar Plateau"
 *               arrivee:
 *                 type: string
 *                 example: "Thiès Gare"
 *               dateDebut:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-31T08:00:00.000Z"
 *               prixParPlace:
 *                 type: number
 *                 minimum: 0
 *                 example: 2500
 *               nbPlacesDisponibles:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       201:
 *         description: Trajet créé
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 */
router.post('/', protect, authorize('CHAUFFEUR'), createTrajet);
router.get('/', getTrajets);

/**
 * @openapi
 * /api/trajets/chauffeur/{chauffeurId}:
 *   get:
 *     summary: Lister les trajets d'un chauffeur
 *     tags: [Trajets]
 *     parameters:
 *       - in: path
 *         name: chauffeurId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des trajets du chauffeur
 */
router.get('/chauffeur/:chauffeurId', getTrajetsChauffeur);

/**
 * @openapi
 * /api/trajets/{id}:
 *   get:
 *     summary: Détails d'un trajet
 *     tags: [Trajets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trajet
 *       404:
 *         description: Non trouvé
 */
router.get('/:id', getTrajet);

/**
 * @openapi
 * /api/trajets/{id}/start:
 *   put:
 *     summary: Démarrer un trajet
 *     tags: [Trajets]
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
 *         description: Trajet démarré
 *       401:
 *         description: Non autorisé
 */
router.put('/:id/start', protect, authorize('CHAUFFEUR'), startTrajet);

/**
 * @openapi
 * /api/trajets/{id}/positions:
 *   post:
 *     summary: Ajouter une position au trajet
 *     tags: [Trajets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 14.6937
 *               longitude:
 *                 type: number
 *                 example: -17.4441
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Position ajoutée
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 */
router.post('/:id/positions', protect, authorize('CHAUFFEUR'), addPosition);

/**
 * @openapi
 * /api/trajets/{id}/end:
 *   put:
 *     summary: Terminer un trajet
 *     tags: [Trajets]
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
 *         description: Trajet terminé
 *       401:
 *         description: Non autorisé
 */
router.put('/:id/end', protect, authorize('CHAUFFEUR'), endTrajet);

/**
 * @openapi
 * /api/trajets/{id}:
 *   delete:
 *     summary: Supprimer un trajet (CHAUFFEUR propriétaire ou ADMIN)
 *     tags: [Trajets]
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
 *         description: Trajet supprimé avec succès
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Interdit
 *       404:
 *         description: Trajet non trouvé
 */
router.delete('/:id', protect, authorize('CHAUFFEUR', 'ADMIN'), deleteTrajet);

module.exports = router;
