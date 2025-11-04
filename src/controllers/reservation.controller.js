const Reservation = require('../models/Reservation');
const Trajet = require('../models/Trajet');

exports.createReservation = async (req, res, next) => {
  try {
    const { trajetId, nbPlaces, adresseDepart, adresseArrivee } = req.body || {};

    if (!trajetId || !nbPlaces || !adresseDepart || !adresseArrivee) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis: trajetId, nbPlaces, adresseDepart, adresseArrivee'
      });
    }

    if (req.user.typeUtilisateur !== 'CLIENT') {
      return res.status(403).json({ 
        success: false,
        message: 'Seuls les clients peuvent créer des réservations' 
      });
    }

    const trajet = await Trajet.findById(trajetId);
    
    if (!trajet) {
      return res.status(404).json({ 
        success: false,
        message: 'Trajet non trouvé' 
      });
    }

    if (trajet.nbPlacesDisponibles < nbPlaces) {
      return res.status(400).json({ 
        success: false,
        message: `Seulement ${trajet.nbPlacesDisponibles} place(s) disponible(s)` 
      });
    }

    if (trajet.statut !== 'DISPONIBLE') {
      return res.status(400).json({ 
        success: false,
        message: 'Ce trajet n\'est plus disponible' 
      });
    }

    const montantTotal = trajet.prixParPlace * nbPlaces;

    const reservation = await Reservation.create({
      client: req.user._id,
      trajet: trajetId,
      nbPlaces,
      adresseDepart,
      adresseArrivee,
      montantTotal
    });

    trajet.nbPlacesDisponibles -= nbPlaces;
    await trajet.save();

    await reservation.populate('trajet');
    await reservation.populate('client', 'prenom nom photo tel');

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      reservation
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour l'état d'une réservation (validation par chauffeur)
exports.updateReservationEtat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { etat } = req.body || {};

    const reservation = await Reservation.findById(id).populate('trajet');
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
    }

    // Autorisé: ADMIN ou chauffeur propriétaire du trajet
    const isAdmin = req.user.typeUtilisateur === 'ADMIN';
    const isOwnerChauffeur = reservation.trajet && reservation.trajet.chauffeur && reservation.trajet.chauffeur.toString() === req.user._id.toString();
    if (!isAdmin && !isOwnerChauffeur) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    // Etats autorisés pour cet endpoint (validation)
    const allowed = ['VALIDEE', 'CONFIRMEE', 'ANNULEE', 'TERMINEE'];
    const newEtat = String(etat || '').toUpperCase();
    if (!allowed.includes(newEtat)) {
      return res.status(400).json({ success: false, message: `Etat invalide. Autorisés: ${allowed.join(', ')}` });
    }

    reservation.etat = newEtat;
    await reservation.save();

    res.json({ success: true, message: 'Réservation mise à jour', reservation });
  } catch (error) {
    next(error);
  }
};

exports.getMesReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ client: req.user._id })
      .populate({
        path: 'trajet',
        populate: { path: 'chauffeur', select: 'prenom nom photo noteEval vehicule' }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reservations.length,
      reservations
    });
  } catch (error) {
    next(error);
  }
};

exports.getReservationsTrajet = async (req, res, next) => {
  try {
    const trajet = await Trajet.findById(req.params.trajetId);
    
    if (!trajet) {
      return res.status(404).json({ 
        success: false,
        message: 'Trajet non trouvé' 
      });
    }

    const isAdmin = req.user.typeUtilisateur === 'ADMIN';
    const isOwnerChauffeur = trajet.chauffeur.toString() === req.user._id.toString();
    if (!isAdmin && !isOwnerChauffeur) {
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé' 
      });
    }

    const reservations = await Reservation.find({ trajet: req.params.trajetId })
      .populate('client', 'prenom nom photo tel')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reservations.length,
      reservations
    });
  } catch (error) {
    next(error);
  }
};

exports.annulerReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
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

    if (reservation.etat === 'TERMINEE') {
      return res.status(400).json({ 
        success: false,
        message: 'Impossible d\'annuler une réservation terminée' 
      });
    }

    if (reservation.etat === 'ANNULEE') {
      return res.status(400).json({ 
        success: false,
        message: 'Cette réservation est déjà annulée' 
      });
    }

    reservation.etat = 'ANNULEE';
    reservation.dateAnnulation = new Date();
    reservation.motifAnnulation = req.body.motif || 'Annulation client';
    await reservation.save();

    const trajet = await Trajet.findById(reservation.trajet);
    if (trajet) {
      trajet.nbPlacesDisponibles += reservation.nbPlaces;
      await trajet.save();
    }

    res.json({
      success: true,
      message: 'Réservation annulée',
      reservation
    });
  } catch (error) {
    next(error);
  }
};
