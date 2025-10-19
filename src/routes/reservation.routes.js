const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  createReservation, 
  getMesReservations, 
  getReservationsTrajet,
  annulerReservation 
} = require('../controllers/reservation.controller');

router.post('/', protect, authorize('CLIENT'), createReservation);
router.get('/mes-reservations', protect, authorize('CLIENT'), getMesReservations);
router.get('/trajet/:trajetId', protect, authorize('CHAUFFEUR'), getReservationsTrajet);
router.delete('/:id', protect, authorize('CLIENT'), annulerReservation);

module.exports = router;
