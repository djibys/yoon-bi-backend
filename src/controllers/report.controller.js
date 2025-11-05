const Report = require('../models/Report');
const Trajet = require('../models/Trajet');
const User = require('../models/User');

function mapReport(r) {
  const client = r.client || {};
  const chauffeur = r.chauffeur || {};
  const trajet = r.trajet || {};
  
  // Mapping des icônes selon le nouveau système de types
  const typeIcons = {
    'RETARD': '⏰',
    'ANNULATION': '🚫',
    'COMPORTEMENT': '⚠️',
    'VEHICULE': '🚗',
    'TRAJET_MODIFIE': '🔄',
    'SECURITE': '🛡️',
    'AUTRE': '📝'
  };
  
  return {
    id: String(r._id),
    date: r.createdAt ? new Date(r.createdAt).toLocaleString('fr-FR') : '',
    type: r.type,
    typeIcon: typeIcons[r.type] || '📝',
    client: {
      name: [client.prenom, client.nom].filter(Boolean).join(' ') || 'Client',
      initials: [client.prenom, client.nom].filter(Boolean).map((s) => s[0]).join('').toUpperCase().slice(0, 2) || 'CL',
      color: 'primary',
    },
    chauffeur: {
      name: [chauffeur.prenom, chauffeur.nom].filter(Boolean).join(' ') || 'Chauffeur',
      initials: [chauffeur.prenom, chauffeur.nom].filter(Boolean).map((s) => s[0]).join('').toUpperCase().slice(0, 2) || 'CH',
      color: 'success',
      alerts: '',
    },
    trajet: [trajet.depart, trajet.arrivee].filter(Boolean).join(' → '),
    dateDu: trajet.dateDebut ? new Date(trajet.dateDebut).toLocaleDateString('fr-FR') : '',
    status: r.status,
    description: r.description || '',
  };
}

exports.listReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', type = 'all', status = 'all' } = req.query || {};
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const match = {};
    if (type !== 'all') match.type = type;
    if (status !== 'all') match.status = status;

    const query = Report.find(match)
      .populate({ path: 'trajet', populate: { path: 'chauffeur', select: 'prenom nom' } })
      .populate({ path: 'client', select: 'prenom nom' })
      .populate({ path: 'chauffeur', select: 'prenom nom' })
      .sort({ createdAt: -1 });

    let itemsRaw = await query.exec();

    const mapped = itemsRaw.map(mapReport);

    const s = String(search || '').trim().toLowerCase();
    const filtered = s
      ? mapped.filter(
          (it) =>
            it.id.toLowerCase().includes(s) ||
            (it.client?.name || '').toLowerCase().includes(s) ||
            (it.chauffeur?.name || '').toLowerCase().includes(s)
        )
      : mapped;

    const total = filtered.length;
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;

    res.json({
      success: true,
      items: filtered.slice(start, end),
      total,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
      page: pageNum,
    });
  } catch (err) {
    next(err);
  }
};

exports.resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const r = await Report.findByIdAndUpdate(id, { status: 'RESOLU' }, { new: true });
    if (!r) return res.status(404).json({ success: false, message: 'Signalement introuvable' });
    res.json({ success: true, item: mapReport(r) });
  } catch (err) {
    next(err);
  }
};

exports.rejectReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const r = await Report.findByIdAndUpdate(id, { status: 'REJETE' }, { new: true });
    if (!r) return res.status(404).json({ success: false, message: 'Signalement introuvable' });
    res.json({ success: true, item: mapReport(r) });
  } catch (err) {
    next(err);
  }
};

// Créer un signalement (CLIENT ou CHAUFFEUR)
exports.createSignalement = async (req, res, next) => {
  try {
    const { type, description, trajetId, reservationId } = req.body;
    const userId = req.user._id;

    // Validation
    if (!type || !description || !trajetId) {
      return res.status(400).json({
        success: false,
        message: 'Type, description et trajetId sont requis'
      });
    }

    if (description.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'La description ne doit pas dépasser 500 caractères'
      });
    }

    // Vérifier que le trajet existe
    const trajet = await Trajet.findById(trajetId);
    if (!trajet) {
      return res.status(404).json({
        success: false,
        message: 'Trajet non trouvé'
      });
    }

    // Déterminer si l'utilisateur est CLIENT ou CHAUFFEUR
    let signaleParType = 'CLIENT';
    if (req.user.typeUtilisateur === 'CHAUFFEUR') {
      signaleParType = 'CHAUFFEUR';
    }

    // Créer le signalement
    const signalement = await Report.create({
      type,
      description,
      trajet: trajetId,
      reservation: reservationId || null,
      signalePar: userId,
      signaleParType,
      status: 'EN_ATTENTE'
    });

    // Populate pour retourner les infos complètes
    await signalement.populate([
      { path: 'trajet', select: 'depart arrivee dateDebut' },
      { path: 'signalePar', select: 'prenom nom email tel' }
    ]);

    console.log('[createSignalement] Signalement créé:', signalement._id, 'par', signaleParType);

    res.status(201).json({
      success: true,
      message: 'Signalement créé avec succès',
      signalement: {
        id: signalement._id,
        type: signalement.type,
        description: signalement.description,
        trajet: signalement.trajet,
        signaleParType: signalement.signaleParType,
        status: signalement.status,
        createdAt: signalement.createdAt
      }
    });

  } catch (error) {
    console.error('[createSignalement] Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du signalement',
      error: error.message
    });
  }
};

// Récupérer mes signalements
exports.getMesSignalements = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const signalements = await Report.find({ signalePar: userId })
      .populate('trajet', 'depart arrivee dateDebut')
      .populate('reservation', 'nbPlaces montantTotal')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: signalements.length,
      signalements: signalements.map(s => ({
        id: s._id,
        type: s.type,
        description: s.description,
        status: s.status,
        trajet: s.trajet,
        reservation: s.reservation,
        createdAt: s.createdAt
      }))
    });

  } catch (error) {
    console.error('[getMesSignalements] Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des signalements',
      error: error.message
    });
  }
};
