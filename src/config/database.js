// Import du module mongoose pour interagir avec MongoDB
const mongoose = require('mongoose');

// Fonction asynchrone pour établir la connexion à MongoDB
const connectDB = async () => {
  try {
    // Tentative de connexion à MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // Messages de succès dans la console
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
    
  } catch (error) {
    // En cas d'erreur de connexion
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);  // Arrête l'application avec un code d'erreur
  }
};

module.exports = connectDB;