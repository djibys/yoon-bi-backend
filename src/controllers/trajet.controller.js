const Trajet = require('../models/Trajet');
const Reservation = require('../models/Reservation');

exports.createTrajet = async (req, res, next) => {
  try {
    const { depart, arrivee, dateDebut, prixParPlace, nbPlacesDisponibles } = req.body;

    if (req.user.typeUtilisateur !== 'CHAUFFEUR') {
      return res.status(403).json({ 
        success: false,
        message: 'Seuls les chauffeurs peuvent créer des trajets' 
      });
    }

    if (req.user.statutValidation !== 'VALIDE') {
      return res.status(403).json({ 
        success: false,
        message: 'Votre compte doit être validé par un administrateur' 
      });
    }

    const trajet = await Trajet.create({
      chauffeur: req.user._id,
      depart,
      arrivee,
      dateDebut,
      prixParPlace,
      nbPlacesDisponibles,
      nbPlacesTotal: nbPlacesDisponibles
    });

    await trajet.populate('chauffeur', 'prenom nom photo noteEval vehicule');

    res.status(201).json({
      success: true,
      message: 'Trajet créé avec succès',
      trajet
    });
  } catch (error) {
    next(error);
  }
};

exports.getTrajets = async (req, res, next) => {
  try {
    const { depart, arrivee, date, places } = req.query;
    
    let query = { 
      statut: 'DISPONIBLE', 
      nbPlacesDisponibles: { $gt: 0 },
      dateDebut: { $gte: new Date() }
    };
    
    if (depart) {
      query.depart = new RegExp(depart, 'i');
    }
    
    if (arrivee) {
      query.arrivee = new RegExp(arrivee, 'i');
    }
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.dateDebut = { $gte: startDate, $lte: endDate };
    }
    
    if (places) {
      query.nbPlacesDisponibles = { $gte: parseInt(places) };
    }

    const trajets = await Trajet.find(query)
      .populate('chauffeur', 'prenom nom photo noteEval vehicule tel')
      .sort({ dateDebut: 1 });

    res.json({
      success: true,
      count: trajets.length,
      trajets
    });
  } catch (error) {
    next(error);
  }
};

exports.getTrajet = async (req, res, next) => {
  try {
    const trajet = await Trajet.findById(req.params.id)
      .populate('chauffeur', 'prenom nom photo noteEval vehicule tel email');
    
    if (!trajet) {
      return res.status(404).json({ 
        success: false,
        message: 'Trajet non trouvé' 
      });
    }

    res.json({
      success: true,
      trajet
    });
  } catch (error) {
    next(error);
  }
};

exports.startTrajet = async (req, res, next) => {
  try {
    const trajet = await Trajet.findById(req.params.id);
    
    if (!trajet) {
      return res.status(404).json({ 
        success: false,
        message: 'Trajet non trouvé' 
      });
    }

    if (trajet.chauffeur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé' 
      });
    }

    if (trajet.statut !== 'DISPONIBLE') {
      return res.status(400).json({ 
        success: false,
        message: 'Ce trajet a déjà démarré ou est terminé' 
      });
    }

    trajet.statut = 'EN_COURS';
    await trajet.save();

    res.json({
      success: true,
      message: 'Trajet démarré',
      trajet
    });
  } catch (error) {
    next(error);
  }
};

exports.addPosition = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    
    const trajet = await Trajet.findById(req.params.id);
    
    if (!trajet) {
      return res.status(404).json({ 
        success: false,
        message: 'Trajet non trouvé' 
      });
    }

    if (trajet.chauffeur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé' 
      });
    }

    if (trajet.statut !== 'EN_COURS') {
      return res.status(400).json({ 
        success: false,
        message: 'Le trajet doit être en cours' 
      });
    }

    trajet.positions.push({ latitude, longitude });
    await trajet.save();

    res.json({
      success: true,
      message: 'Position ajoutée',
      position: { latitude, longitude, horodatage: new Date() }
    });
  } catch (error) {
    next(error);
  }
};

exports.endTrajet = async (req, res, next) => {
  try {
    const trajet = await Trajet.findById(req.params.id);
    
    if (!trajet) {
      return res.status(404).json({ 
        success: false,
        message: 'Trajet non trouvé' 
      });
    }

    if (trajet.chauffeur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé' 
      });
    }

    if (trajet.statut !== 'EN_COURS') {
      return res.status(400).json({ 
        success: false,
        message: 'Le trajet doit être en cours pour être terminé' 
      });
    }

    trajet.statut = 'TERMINE';
    trajet.dateFin = new Date();
    await trajet.save();

    await Reservation.updateMany(
      { trajet: trajet._id, etat: 'CONFIRMEE' },
      { etat: 'TERMINEE' }
    );

    res.json({
      success: true,
      message: 'Trajet terminé',
      trajet
    });
  } catch (error) {
    next(error);
  }
};

exports.getTrajetsChauffeur = async (req, res, next) => {
  try {
    const trajets = await Trajet.find({ chauffeur: req.params.chauffeurId })
      .sort({ dateDebut: -1 })
      .limit(20);

    res.json({
      success: true,
      count: trajets.length,
      trajets
    });
  } catch (error) {
    next(error);
  }
};
