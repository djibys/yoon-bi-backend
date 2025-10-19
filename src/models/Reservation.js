const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  trajet: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trajet', 
    required: true 
  },
  nbPlaces: { 
    type: Number, 
    required: true,
    min: [1, 'Au moins une place doit être réservée']
  },
  adresseDepart: { 
    type: String, 
    required: true 
  },
  adresseArrivee: { 
    type: String, 
    required: true 
  },
  etat: { 
    type: String, 
    enum: ['EN_ATTENTE', 'CONFIRMEE', 'ANNULEE', 'TERMINEE'],
    default: 'EN_ATTENTE'
  },
  montantTotal: { 
    type: Number, 
    required: true,
    min: 0
  },
  dateAnnulation: Date,
  motifAnnulation: String
}, { timestamps: true });

reservationSchema.index({ client: 1, createdAt: -1 });
reservationSchema.index({ trajet: 1 });
reservationSchema.index({ etat: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);