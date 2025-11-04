const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { listReports, resolveReport, rejectReport } = require('../controllers/report.controller');

/**
 * @openapi
 * tags:
 *   - name: Reports (Admin)
 *     description: Gestion des signalements (ADMIN)
 */

/**
 * @openapi
 * /api/admin/reports:
 *   get:
 *     summary: Lister les signalements (paginé)
 *     tags: [Reports (Admin)]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', protect, authorize('ADMIN'), listReports);

/**
 * @openapi
 * /api/admin/reports/{id}/resolve:
 *   put:
 *     summary: Marquer un signalement comme résolu
 *     tags: [Reports (Admin)]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/resolve', protect, authorize('ADMIN'), resolveReport);

/**
 * @openapi
 * /api/admin/reports/{id}/reject:
 *   put:
 *     summary: Marquer un signalement comme rejeté
 *     tags: [Reports (Admin)]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/reject', protect, authorize('ADMIN'), rejectReport);

module.exports = router;
