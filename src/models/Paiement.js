const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  reservation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reservation', 
    required: true,
    unique: true
  },
  montant: { 
    type: Number, 
    required: true,
    min: 0
  },
  methode: { 
    type: String, 
    enum: ['CARTE_BANCAIRE', 'MOBILE_MONEY', 'ESPECES'],
    required: true
  },
  ref: { 
    type: String, 
    required: true, 
    unique: true,
    default: function() {
      return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
  },
  statut: { 
    type: String, 
    enum: ['EN_ATTENTE', 'SUCCESS', 'ECHEC', 'REMBOURSE'],
    default: 'EN_ATTENTE'
  },
  detailsMethode: {
    numeroTelephone: String,
    dernierChiffres: String,
    operateur: String
  },
  dateRemboursement: Date,
  montantRembourse: Number
}, { timestamps: true });

module.exports = mongoose.model('Paiement', paiementSchema);
