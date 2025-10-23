const User = require('../models/User');
const Trajet = require('../models/Trajet');
const Reservation = require('../models/Reservation');
const Paiement = require('../models/Paiement');

exports.getStatistics = async (req, res, next) => {
  try {
    const stats = {
      utilisateurs: {
        total: await User.countDocuments(),
        clients: await User.countDocuments({ typeUtilisateur: 'CLIENT' }),
        chauffeurs: await User.countDocuments({ typeUtilisateur: 'CHAUFFEUR' }),
        chauffeursEnAttente: await User.countDocuments({ 
          typeUtilisateur: 'CHAUFFEUR', 
          statutValidation: 'EN_ATTENTE' 
        })
      },
      trajets: {
        total: await Trajet.countDocuments(),
        disponibles: await Trajet.countDocuments({ statut: 'DISPONIBLE' }),
        enCours: await Trajet.countDocuments({ statut: 'EN_COURS' }),
        termines: await Trajet.countDocuments({ statut: 'TERMINE' })
      },
      reservations: {
        total: await Reservation.countDocuments(),
        confirmees: await Reservation.countDocuments({ etat: 'CONFIRMEE' }),
        annulees: await Reservation.countDocuments({ etat: 'ANNULEE' }),
        terminees: await Reservation.countDocuments({ etat: 'TERMINEE' })
      },
      revenus: await Paiement.aggregate([
        { $match: { statut: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$montant' } } }
      ])
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

exports.getChauffeursPending = async (req, res, next) => {
  try {
    const chauffeurs = await User.find({
      typeUtilisateur: 'CHAUFFEUR',
      statutValidation: 'EN_ATTENTE'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: chauffeurs.length,
      chauffeurs
    });
  } catch (error) {
    next(error);
  }
};

exports.validateChauffeur = async (req, res, next) => {
  try {
    const { decision } = req.body || {};

    if (!decision || !['VALIDE', 'REJETE'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Champ 'decision' requis et doit être 'VALIDE' ou 'REJETE'"
      });
    }

    const chauffeur = await User.findById(req.params.id);
    
    if (!chauffeur) {
      return res.status(404).json({ 
        success: false,
        message: 'Chauffeur non trouvé' 
      });
    }

    if (chauffeur.typeUtilisateur !== 'CHAUFFEUR') {
      return res.status(400).json({ 
        success: false,
        message: 'Cet utilisateur n\'est pas un chauffeur' 
      });
    }

    chauffeur.statutValidation = decision;
    await chauffeur.save();

    res.json({
      success: true,
      message: `Chauffeur ${decision === 'VALIDE' ? 'validé' : 'rejeté'}`,
      chauffeur
    });
  } catch (error) {
    next(error);
  }
};
