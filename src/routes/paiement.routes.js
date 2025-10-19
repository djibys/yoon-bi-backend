const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { traiterPaiement, getPaiement } = require('../controllers/paiement.controller');

router.post('/', protect, traiterPaiement);
router.get('/:ref', protect, getPaiement);

module.exports = router;
