const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'RETARD',
        'ANNULATION', 
        'COMPORTEMENT',
        'VEHICULE',
        'TRAJET_MODIFIE',
        'SECURITE',
        'AUTRE'
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['EN_ATTENTE', 'EN_COURS', 'RESOLU', 'REJETE'],
      default: 'EN_ATTENTE',
      index: true,
    },
    description: { 
      type: String,
      required: true,
      maxlength: 500
    },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
    trajet: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Trajet',
      required: true 
    },
    // Celui qui a signalé
    signalePar: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    signaleParType: {
      type: String,
      enum: ['CLIENT', 'CHAUFFEUR'],
      required: true
    },
    // Pour compatibilité avec l'ancien système
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chauffeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Réponse du support
    reponseSupport: String,
    traitePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateTraitement: Date
  },
  { timestamps: true }
);

reportSchema.index({ type: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
