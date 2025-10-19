const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getStatistics, 
  getChauffeursPending, 
  validateChauffeur 
} = require('../controllers/admin.controller');

router.get('/statistics', protect, authorize('ADMIN'), getStatistics);
router.get('/chauffeurs/pending', protect, authorize('ADMIN'), getChauffeursPending);
router.put('/chauffeurs/:id/validate', protect, authorize('ADMIN'), validateChauffeur);

module.exports = router;
