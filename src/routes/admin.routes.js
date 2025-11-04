const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getStatistics, 
  getChauffeursPending, 
  validateChauffeur,
  listUsers,
  blockUser,
  unblockUser
} = require('../controllers/admin.controller');

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Endpoints d'administration (ADMIN)
 */
/**
 * @openapi
 * /api/admin/statistics:
 *   get:
 *     summary: Obtenir des statistiques globales
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques
 *       401:
 *         description: Non autorisé
 */
router.get('/statistics', protect, authorize('ADMIN'), getStatistics);
/**
 * @openapi
 * /api/admin/chauffeurs/pending:
 *   get:
 *     summary: Lister les chauffeurs en attente de validation
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des chauffeurs en attente
 *       401:
 *         description: Non autorisé
 */
router.get('/chauffeurs/pending', protect, authorize('ADMIN'), getChauffeursPending);
/**
 * @openapi
 * /api/admin/chauffeurs/{id}/validate:
 *   put:
 *     summary: Valider un chauffeur
 *     tags: [Admin]
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
 *         description: Chauffeur validé
 *       401:
 *         description: Non autorisé
 */
router.put('/chauffeurs/:id/validate', protect, authorize('ADMIN'), validateChauffeur);

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Lister les utilisateurs (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users', protect, authorize('ADMIN'), listUsers);

/**
 * @openapi
 * /api/admin/users/{id}/block:
 *   put:
 *     summary: Bloquer un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put('/users/:id/block', protect, authorize('ADMIN'), blockUser);

/**
 * @openapi
 * /api/admin/users/{id}/unblock:
 *   put:
 *     summary: Débloquer un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put('/users/:id/unblock', protect, authorize('ADMIN'), unblockUser);

module.exports = router;
