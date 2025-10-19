const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createEvaluation, getEvaluationsChauffeur } = require('../controllers/evaluation.controller');

router.post('/', protect, authorize('CLIENT'), createEvaluation);
router.get('/chauffeur/:chauffeurId', getEvaluationsChauffeur);

module.exports = router;
