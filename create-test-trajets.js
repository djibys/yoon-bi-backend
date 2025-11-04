require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Trajet = require('./src/models/Trajet');

async function createTestTrajets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver un chauffeur existant ou en créer un
    let chauffeur = await User.findOne({ typeUtilisateur: 'CHAUFFEUR' });
    
    if (!chauffeur) {
      console.log('Aucun chauffeur trouvé, création d\'un chauffeur test...');
      chauffeur = await User.create({
        prenom: 'Amadou',
        nom: 'Diop',
        email: 'amadou.chauffeur@test.com',
        tel: '771234567',
        motDePasse: 'test123',
        typeUtilisateur: 'CHAUFFEUR',
        statutValidation: 'VALIDE',
        numPermis: 'SN123456',
        dateValiditePermis: new Date('2026-12-31'),
        vehicule: {
          marque: 'Toyota',
          modele: 'Corolla',
          immatriculation: 'DK-1234-AB',
          typeVehicule: 'Berline',
          nombrePlaces: 4,
          assurance: '12345-ASSUR',
        }
      });
      console.log('✅ Chauffeur créé:', chauffeur.email);
    } else {
      // S'assurer que le chauffeur est validé
      if (chauffeur.statutValidation !== 'VALIDE') {
        chauffeur.statutValidation = 'VALIDE';
        await chauffeur.save();
        console.log('✅ Chauffeur validé');
      }
      console.log('✅ Chauffeur trouvé:', chauffeur.email);
    }

    // Créer des trajets de test
    const trajetsTest = [
      {
        chauffeur: chauffeur._id,
        depart: 'Dakar',
        arrivee: 'Thiès',
        dateDebut: new Date(Date.now() + 2 * 60 * 60 * 1000), // Dans 2 heures
        prixParPlace: 2500,
        nbPlacesDisponibles: 3,
        nbPlacesTotal: 4,
        statut: 'DISPONIBLE'
      },
      {
        chauffeur: chauffeur._id,
        depart: 'Dakar',
        arrivee: 'Saint-Louis',
        dateDebut: new Date(Date.now() + 5 * 60 * 60 * 1000), // Dans 5 heures
        prixParPlace: 5000,
        nbPlacesDisponibles: 4,
        nbPlacesTotal: 4,
        statut: 'DISPONIBLE'
      },
      {
        chauffeur: chauffeur._id,
        depart: 'Thiès',
        arrivee: 'Dakar',
        dateDebut: new Date(Date.now() + 3 * 60 * 60 * 1000), // Dans 3 heures
        prixParPlace: 2500,
        nbPlacesDisponibles: 2,
        nbPlacesTotal: 4,
        statut: 'DISPONIBLE'
      },
      {
        chauffeur: chauffeur._id,
        depart: 'Dakar',
        arrivee: 'Mbour',
        dateDebut: new Date(Date.now() + 4 * 60 * 60 * 1000), // Dans 4 heures
        prixParPlace: 3500,
        nbPlacesDisponibles: 3,
        nbPlacesTotal: 4,
        statut: 'DISPONIBLE'
      },
      {
        chauffeur: chauffeur._id,
        depart: 'Kaolack',
        arrivee: 'Dakar',
        dateDebut: new Date(Date.now() + 6 * 60 * 60 * 1000), // Dans 6 heures
        prixParPlace: 4000,
        nbPlacesDisponibles: 4,
        nbPlacesTotal: 4,
        statut: 'DISPONIBLE'
      }
    ];

    // Supprimer les anciens trajets de test
    await Trajet.deleteMany({ chauffeur: chauffeur._id });
    console.log('🗑️  Anciens trajets supprimés');

    // Créer les nouveaux trajets
    const trajets = await Trajet.insertMany(trajetsTest);
    console.log(`✅ ${trajets.length} trajets créés avec succès!`);

    // Afficher les trajets créés
    console.log('\n📋 Trajets créés:');
    trajets.forEach((t, index) => {
      console.log(`${index + 1}. ${t.depart} → ${t.arrivee} - ${t.prixParPlace} FCFA - ${t.nbPlacesDisponibles} places`);
    });

    console.log('\n✅ Base de données prête pour les tests!');
    console.log('\n🧪 Pour tester la recherche:');
    console.log('   GET http://localhost:3000/api/trajets');
    console.log('   GET http://localhost:3000/api/trajets?depart=Dakar');
    console.log('   GET http://localhost:3000/api/trajets?depart=Dakar&arrivee=Thiès');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
  }
}

createTestTrajets();
