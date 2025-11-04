const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getFinanceStats, getFinancePayments, getFinancePendingTrips } = require('../controllers/finance.controller');

/**
 * @openapi
 * tags:
 *   - name: Finance (Admin)
 *     description: Endpoints financiers d'administration
 */

/**
 * @openapi
 * /api/admin/finance/stats:
 *   get:
 *     summary: Statistiques financières agrégées
 *     tags: [Finance (Admin)]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', protect, authorize('ADMIN'), getFinanceStats);

/**
 * @openapi
 * /api/admin/finance/payments:
 *   get:
 *     summary: Liste paginée des paiements
 *     tags: [Finance (Admin)]
 *     security:
 *       - bearerAuth: []
 */
router.get('/payments', protect, authorize('ADMIN'), getFinancePayments);

/**
 * @openapi
 * /api/admin/finance/pending-trips:
 *   get:
 *     summary: Trajets payés en attente de validation client
 *     tags: [Finance (Admin)]
 *     security:
 *       - bearerAuth: []
 */
router.get('/pending-trips', protect, authorize('ADMIN'), getFinancePendingTrips);

module.exports = router;
