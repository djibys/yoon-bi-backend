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
  getTrajetsChauffeur
} = require('../controllers/trajet.controller');

router.post('/', protect, authorize('CHAUFFEUR'), createTrajet);
router.get('/', getTrajets);
router.get('/:id', getTrajet);
router.get('/chauffeur/:chauffeurId', getTrajetsChauffeur);
router.put('/:id/start', protect, authorize('CHAUFFEUR'), startTrajet);
router.post('/:id/positions', protect, authorize('CHAUFFEUR'), addPosition);
router.put('/:id/end', protect, authorize('CHAUFFEUR'), endTrajet);

module.exports = router;
