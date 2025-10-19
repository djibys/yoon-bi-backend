const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  reservation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reservation', 
    required: true,
    unique: true
  },
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  chauffeur: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  note: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  commentaire: { 
    type: String, 
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères'],
    trim: true
  },
  criteres: {
    ponctualite: { type: Number, min: 1, max: 5 },
    conduite: { type: Number, min: 1, max: 5 },
    proprete: { type: Number, min: 1, max: 5 },
    amabilite: { type: Number, min: 1, max: 5 }
  }
}, { timestamps: true });

evaluationSchema.index({ chauffeur: 1, createdAt: -1 });
evaluationSchema.index({ client: 1 });

evaluationSchema.post('save', async function() {
  const User = mongoose.model('User');
  const Evaluation = mongoose.model('Evaluation');
  
  const stats = await Evaluation.aggregate([
    { $match: { chauffeur: this.chauffeur } },
    { $group: {
      _id: '$chauffeur',
      avgNote: { $avg: '$note' },
      nbEvaluations: { $sum: 1 }
    }}
  ]);
  
  if (stats.length > 0) {
    await User.findByIdAndUpdate(this.chauffeur, {
      noteEval: Math.round(stats[0].avgNote * 10) / 10,
      nbCourses: stats[0].nbEvaluations
    });
  }
});

module.exports = mongoose.model('Evaluation', evaluationSchema);