const Trajet = require('../models/Trajet');
const Reservation = require('../models/Reservation');

exports.createTrajet = async (req, res, next) => {
  try {
    const { depart, arrivee, dateDebut, prixParPlace, nbPlacesDisponibles } = req.body || {};

    if (!depart || !arrivee || !dateDebut || (!Number.isFinite(prixParPlace) && prixParPlace !== 0) || !nbPlacesDisponibles) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis: depart, arrivee, dateDebut, prixParPlace, nbPlacesDisponibles'
      });
    }

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
    const { depart, arrivee, date, places, all } = req.query;
    
    let query = {};
    const onlyAvailable = String(all).toLowerCase() !== 'true';
    if (onlyAvailable) {
      // Option B: ne pas filtrer sur dateDebut future
      // Afficher tous les trajets EN_COURS ou DISPONIBLE avec des places > 0
      query.$and = [
        { nbPlacesDisponibles: { $gt: 0 } },
        { $or: [ { statut: 'EN_COURS' }, { statut: 'DISPONIBLE' } ] }
      ];
    }
    
    // Construire des clés de recherche tolérantes (insensible aux accents)
    const escapeRegex = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const diacritics = {
      a: '[aàáâäãåæ]',
      c: '[cç]',
      e: '[eèéêë]',
      i: '[iìíîï]',
      o: '[oòóôöõœ]',
      u: '[uùúûü]',
      y: '[yýÿ]',
      n: '[nñ]',
      s: '[sß]'
    };
    const toDiacriticPattern = (s = '') => {
      return escapeRegex(String(s)).replace(/[aceiouns]/gi, (ch) => {
        const lower = ch.toLowerCase();
        const group = diacritics[lower];
        if (!group) return ch;
        return ch === lower ? group : group.replace('[', '[A' + group.slice(2));
      });
    };
    const extractKey = (val = '') => {
      const raw = String(val);
      // Couper sur virgule, tiret court et tiret long (en dash)
      const firstPart = raw.split(/[，,–-]/)[0].trim();
      // Prendre le premier mot significatif (avant espaces multiples)
      const main = firstPart.split(/\s+/)[0].trim();
      return main;
    };
    if (depart) {
      const depMain = extractKey(depart);
      if (depMain) query.depart = new RegExp(toDiacriticPattern(depMain), 'i');
    }

    if (arrivee) {
      const arrMain = extractKey(arrivee);
      if (arrMain) query.arrivee = new RegExp(toDiacriticPattern(arrMain), 'i');
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
      .collation({ locale: 'fr', strength: 1 }) // insensible aux accents/casse
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
    const { latitude, longitude } = req.body || {};

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis: latitude, longitude'
      });
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude et longitude doivent être des nombres'
      });
    }

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

exports.deleteTrajet = async (req, res, next) => {
  try {
    const trajet = await Trajet.findById(req.params.id);

    if (!trajet) {
      return res.status(404).json({
        success: false,
        message: 'Trajet non trouvé'
      });
    }

    const isOwner = trajet.chauffeur.toString() === req.user._id.toString();
    const isAdmin = req.user.typeUtilisateur === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    if (trajet.statut !== 'DISPONIBLE') {
      return res.status(400).json({
        success: false,
        message: 'Seuls les trajets DISPONIBLE peuvent être supprimés'
      });
    }

    const reservationsCount = await Reservation.countDocuments({ trajet: trajet._id });
    if (reservationsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un trajet ayant des réservations'
      });
    }

    await trajet.deleteOne();

    res.json({
      success: true,
      message: 'Trajet supprimé avec succès'
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
