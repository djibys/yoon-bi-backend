const Paiement = require('../models/Paiement');
const Reservation = require('../models/Reservation');
const Trajet = require('../models/Trajet');
const User = require('../models/User');

function getPeriodRange(period, from, to) {
  const now = new Date();
  let start, end;
  if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    start = new Date(now.getFullYear(), q * 3, 1);
    end = new Date(now.getFullYear(), q * 3 + 3, 1);
  } else if (period === 'year') {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear() + 1, 0, 1);
  } else if (period === 'custom' && from && to) {
    start = new Date(from);
    end = new Date(to);
  } else {
    // default month
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  return { start, end };
}

exports.getFinanceStats = async (req, res, next) => {
  try {
    const { period = 'month', from, to } = req.query || {};
    const { start, end } = getPeriodRange(period, from, to);

    // Total revenus = somme des paiements succès dans la période
    const paiements = await Paiement.find({
      statut: 'SUCCESS',
      createdAt: { $gte: start, $lt: end },
    }).lean();

    const totalRevenue = paiements.reduce((s, p) => s + (p.montant || 0), 0);
    const commission = Math.round(totalRevenue * 0.15);
    const paidToDrivers = totalRevenue - commission;

    // En attente: réservations payées mais pas terminées
    const pendingReservations = await Reservation.find({
      etat: 'CONFIRMEE',
      createdAt: { $lt: end },
    }).lean();
    const pendingValidation = pendingReservations.reduce((s, r) => s + (r.montantTotal || 0), 0);

    // Statistiques du mois (ou période)
    const completedReservations = await Reservation.find({
      etat: 'TERMINEE',
      updatedAt: { $gte: start, $lt: end },
    }).lean();
    const completedTrips = completedReservations.length;
    const totalTripPrice = completedReservations.reduce((s, r) => s + (r.montantTotal || 0), 0);
    const commissionMonth = Math.round(totalTripPrice * 0.15);
    const netPaid = totalTripPrice - commissionMonth;

    res.json({
      success: true,
      kpi: {
        totalRevenue,
        commission,
        paidToDrivers,
        pendingValidation,
      },
      monthly: {
        completedTrips,
        totalTripPrice,
        commission: commissionMonth,
        netPaid,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getFinancePayments = async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 10, search = '' } = req.query || {};
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const match = {};
    if (status !== 'all') {
      match.statut = status === 'success' ? 'SUCCESS' : 'EN_ATTENTE';
    }

    const query = Paiement.find(match)
      .populate({
        path: 'reservation',
        populate: [
          { path: 'trajet', populate: { path: 'chauffeur', select: 'prenom nom' } },
          { path: 'client', select: 'prenom nom' },
        ],
      })
      .sort({ createdAt: -1 });

    const itemsRaw = await query.exec();

    // map to client schema (before filtering/pagination)
    let mapped = itemsRaw.map((p) => {
      const r = p.reservation || {};
      const t = r.trajet || {};
      const driver = t.chauffeur || {};
      const client = r.client || {};
      const driverName = [driver.prenom, driver.nom].filter(Boolean).join(' ') || 'Chauffeur';
      const clientName = [client.prenom, client.nom].filter(Boolean).join(' ') || 'Client';
      const tripLabel = [t.depart, t.arrivee].filter(Boolean).join(' → ');
      return {
        id: p.ref,
        date: p.createdAt ? new Date(p.createdAt).toLocaleString('fr-FR') : '',
        driver: driverName,
        driverAvatar: driverName
          .split(' ')
          .map((s) => s[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        trip: tripLabel,
        client: clientName,
        totalPrice: r.montantTotal || p.montant || 0,
        commission: Math.round((r.montantTotal || p.montant || 0) * 0.15),
        amountPaid: Math.round((r.montantTotal || p.montant || 0) * 0.85),
        paymentMethod: p.methode || '—',
        phone: p.detailsMethode?.numeroTelephone || undefined,
        status: p.statut === 'SUCCESS' ? 'success' : 'pending',
      };
    });

    // search filter on mapped fields (then paginate)
    const s = String(search || '').trim().toLowerCase();
    if (s) {
      mapped = mapped.filter((it) =>
        (it.driver || '').toLowerCase().includes(s) ||
        (it.id || '').toLowerCase().includes(s) ||
        (it.client || '').toLowerCase().includes(s)
      );
    }

    const total = mapped.length;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const items = mapped.slice(startIndex, endIndex);

    res.json({
      success: true,
      items,
      total,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
      page: pageNum,
    });
  } catch (err) {
    next(err);
  }
};

exports.getFinancePendingTrips = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ etat: 'CONFIRMEE' })
      .populate({ path: 'trajet', populate: { path: 'chauffeur', select: 'prenom nom' } })
      .populate({ path: 'client', select: 'prenom nom' })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();

    const items = reservations.map((r) => {
      const t = r.trajet || {};
      const driver = t.chauffeur || {};
      const client = r.client || {};
      return {
        trip: [t.depart, t.arrivee].filter(Boolean).join(' → '),
        client: [client.prenom, client.nom].filter(Boolean).join(' '),
        driver: [driver.prenom, driver.nom].filter(Boolean).join(' '),
        tripDate: t.dateDebut ? new Date(t.dateDebut).toLocaleDateString('fr-FR') : '',
        amount: r.montantTotal || 0,
      };
    });

    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
};
