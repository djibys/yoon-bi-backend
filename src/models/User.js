const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  prenom: { 
    type: String, 
    required: [true, 'Le prénom est requis'],
    trim: true 
  },
  nom: { 
    type: String, 
    required: [true, 'Le nom est requis'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  tel: { 
    type: String, 
    required: [true, 'Le téléphone est requis'],
    match: [/^[0-9+\s-()]+$/, 'Numéro de téléphone invalide']
  },
  motDePasse: { 
    type: String, 
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
    select: false
  },
  photo: { 
    type: String, 
    default: 'default-avatar.png' 
  },
  typeUtilisateur: { 
    type: String, 
    enum: {
      values: ['ADMIN', 'CLIENT', 'CHAUFFEUR'],
      message: '{VALUE} n\'est pas un type valide'
    },
    required: true 
  },
  numPermis: { 
    type: String,
    required: function() { 
      return this.typeUtilisateur === 'CHAUFFEUR'; 
    }
  },
  dateValiditePermis: { 
    type: Date,
    required: function() { 
      return this.typeUtilisateur === 'CHAUFFEUR'; 
    }
  },
  dateValiditePermisCir: { 
    type: Date 
  },
  disponibilite: { 
    type: Boolean, 
    default: true 
  },
  noteEval: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  nbCourses: { 
    type: Number, 
    default: 0 
  },
  statutValidation: { 
    type: String, 
    enum: ['EN_ATTENTE', 'VALIDE', 'REJETE'],
    default: function() {
      return this.typeUtilisateur === 'CHAUFFEUR' ? 'EN_ATTENTE' : 'VALIDE';
    }
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  vehicule: {
    typeVehicule: { 
      type: String
    },
    typeClasse: {
      type: String
    },
    couleur: String,
    nbPlaces: { 
      type: Number,
      min: 1,
      max: 9
    },
    nombrePlaces: {
      type: Number,
      min: 1,
      max: 9
    },
    immatriculation: { 
      type: String,
      uppercase: true
    },
    marque: String,
    modele: String,
    assurance: {
      type: String
    },
    photo: {
      type: String,
      default: null
    }
  },
  actif: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next();
  this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.motDePasse);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.motDePasse;
  return obj;
};

module.exports = mongoose.model('User', userSchema);