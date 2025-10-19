const Paiement = require('../models/Paiement');
const Reservation = require('../models/Reservation');

exports.traiterPaiement = async (req, res, next) => {
  try {
    const { reservationId, methode, detailsMethode } = req.body;

    const reservation = await Reservation.findById(reservationId);
    
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

    if (reservation.etat !== 'EN_ATTENTE') {
      return res.status(400).json({ 
        success: false,
        message: 'Cette réservation a déjà été payée ou annulée' 
      });
    }

    const existingPaiement = await Paiement.findOne({ reservation: reservationId });
    if (existingPaiement) {
      return res.status(400).json({ 
        success: false,
        message: 'Un paiement existe déjà pour cette réservation' 
      });
    }

    const paiement = await Paiement.create({
      reservation: reservationId,
      montant: reservation.montantTotal,
      methode,
      detailsMethode,
      statut: 'SUCCESS'
    });

    reservation.etat = 'CONFIRMEE';
    await reservation.save();

    res.status(201).json({
      success: true,
      message: 'Paiement effectué avec succès',
      paiement
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaiement = async (req, res, next) => {
  try {
    const paiement = await Paiement.findOne({ ref: req.params.ref })
      .populate({
        path: 'reservation',
        populate: { path: 'trajet client' }
      });
    
    if (!paiement) {
      return res.status(404).json({ 
        success: false,
        message: 'Paiement non trouvé' 
      });
    }

    res.json({
      success: true,
      paiement
    });
  } catch (error) {
    next(error);
  }
};