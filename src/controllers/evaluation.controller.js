const Evaluation = require('../models/Evaluation');
const Reservation = require('../models/Reservation');

exports.createEvaluation = async (req, res, next) => {
  try {
    const { reservationId, note, commentaire, criteres } = req.body;

    if (req.user.typeUtilisateur !== 'CLIENT') {
      return res.status(403).json({ 
        success: false,
        message: 'Seuls les clients peuvent évaluer' 
      });
    }

    const reservation = await Reservation.findById(reservationId).populate('trajet');
    
    if (!reservation) {
      return res.status(404).json({ 
        success: false,
        message: 'Réservation non trouvée' 
      });
    }

    if (reservation.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé' 
      });
    }

    if (reservation.etat !== 'TERMINEE') {
      return res.status(400).json({ 
        success: false,
        message: 'Vous pouvez évaluer uniquement les trajets terminés' 
      });
    }

    const existingEval = await Evaluation.findOne({ reservation: reservationId });
    if (existingEval) {
      return res.status(400).json({ 
        success: false,
        message: 'Vous avez déjà évalué ce trajet' 
      });
    }

    const evaluation = await Evaluation.create({
      reservation: reservationId,
      client: req.user._id,
      chauffeur: reservation.trajet.chauffeur,
      note,
      commentaire,
      criteres
    });

    res.status(201).json({
      success: true,
      message: 'Évaluation soumise avec succès',
      evaluation
    });
  } catch (error) {
    next(error);
  }
};

exports.getEvaluationsChauffeur = async (req, res, next) => {
  try {
    const evaluations = await Evaluation.find({ chauffeur: req.params.chauffeurId })
      .populate('client', 'prenom nom photo')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: evaluations.length,
      evaluations
    });
  } catch (error) {
    next(error);
  }
};
