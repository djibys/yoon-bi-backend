const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  createReservation, 
  getMesReservations, 
  getReservationsTrajet,
  annulerReservation 
} = require('../controllers/reservation.controller');

/**
 * @openapi
 * tags:
 *   - name: Reservations
 *     description: Gestion des réservations
 */
/**
 * @openapi
 * /api/reservations:
 *   post:
 *     summary: Créer une réservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trajetId
 *               - nbPlaces
 *               - adresseDepart
 *               - adresseArrivee
 *             properties:
 *               trajetId:
 *                 type: string
 *                 example: "66f9f3b1c9f1a2b345678901"
 *               nbPlaces:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *               adresseDepart:
 *                 type: string
 *                 example: "Dakar Plateau"
 *               adresseArrivee:
 *                 type: string
 *                 example: "Thiès Gare"
 *     responses:
 *       201:
 *         description: Réservation créée
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 */
router.post('/', protect, authorize('CLIENT'), createReservation);
/**
 * @openapi
 * /api/reservations/mes-reservations:
 *   get:
 *     summary: Lister mes réservations (CLIENT)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réservations
 *       401:
 *         description: Non autorisé
 */
router.get('/mes-reservations', protect, authorize('CLIENT'), getMesReservations);
/**
 * @openapi
 * /api/reservations/trajet/{trajetId}:
 *   get:
 *     summary: Lister les réservations d'un trajet (CHAUFFEUR)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trajetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Réservations du trajet
 *       401:
 *         description: Non autorisé
 */
router.get('/trajet/:trajetId', protect, authorize('CHAUFFEUR'), getReservationsTrajet);
/**
 * @openapi
 * /api/reservations/{id}:
 *   delete:
 *     summary: Annuler une réservation (CLIENT)
 *     tags: [Reservations]
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
 *         description: Réservation annulée
 *       401:
 *         description: Non autorisé
 */
router.delete('/:id', protect, authorize('CLIENT'), annulerReservation);

module.exports = router;
