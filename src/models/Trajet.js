const mongoose = require('mongoose');

const trajetSchema = new mongoose.Schema({
  chauffeur: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  depart: { 
    type: String, 
    required: [true, 'Le point de départ est requis'],
    trim: true
  },
  arrivee: { 
    type: String, 
    required: [true, 'Le point d\'arrivée est requis'],
    trim: true
  },
  dateDebut: { 
    type: Date, 
    required: [true, 'La date de départ est requise']
  },
  dateFin: { 
    type: Date 
  },
  prixParPlace: { 
    type: Number, 
    required: [true, 'Le prix par place est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  nbPlacesDisponibles: { 
    type: Number, 
    required: true,
    min: 0
  },
  nbPlacesTotal: { 
    type: Number, 
    required: true,
    min: 1
  },
  statut: { 
    type: String, 
    enum: ['DISPONIBLE', 'EN_COURS', 'TERMINE', 'ANNULE'],
    default: 'DISPONIBLE'
  },
  distanceParcourue: { 
    type: Number, 
    default: 0,
    min: 0
  },
  positions: [{
    latitude: { 
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: { 
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    horodatage: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { timestamps: true });

trajetSchema.index({ depart: 1, arrivee: 1, dateDebut: 1 });
trajetSchema.index({ chauffeur: 1 });
trajetSchema.index({ statut: 1 });

module.exports = mongoose.model('Trajet', trajetSchema);
