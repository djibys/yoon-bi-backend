/**
 * Script de test pour vérifier et créer des données financières de test
 * Usage: node src/scripts/test-finance-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Trajet = require('../models/Trajet');
const Reservation = require('../models/Reservation');
const Paiement = require('../models/Paiement');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yoonbi');
    console.log('✓ Connecté à MongoDB');
  } catch (error) {
    console.error('✗ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
}

async function checkData() {
  console.log('\n📊 Vérification des données existantes...\n');

  const usersCount = await User.countDocuments();
  const trajetsCount = await Trajet.countDocuments();
  const reservationsCount = await Reservation.countDocuments();
  const paiementsCount = await Paiement.countDocuments();

  console.log(`👥 Utilisateurs: ${usersCount}`);
  console.log(`🚗 Trajets: ${trajetsCount}`);
  console.log(`📋 Réservations: ${reservationsCount}`);
  console.log(`💰 Paiements: ${paiementsCount}`);

  // Détails des paiements
  const paiementsSuccess = await Paiement.countDocuments({ statut: 'SUCCESS' });
  const paiementsEnAttente = await Paiement.countDocuments({ statut: 'EN_ATTENTE' });
  
  console.log(`\n💳 Paiements SUCCESS: ${paiementsSuccess}`);
  console.log(`⏳ Paiements EN_ATTENTE: ${paiementsEnAttente}`);

  // Détails des réservations
  const resConfirmees = await Reservation.countDocuments({ etat: 'CONFIRMEE' });
  const resTerminees = await Reservation.countDocuments({ etat: 'TERMINEE' });
  
  console.log(`\n✅ Réservations CONFIRMEE: ${resConfirmees}`);
  console.log(`🏁 Réservations TERMINEE: ${resTerminees}`);

  return {
    usersCount,
    trajetsCount,
    reservationsCount,
    paiementsCount,
    paiementsSuccess,
    resTerminees
  };
}

async function createTestData() {
  console.log('\n🔧 Création de données de test...\n');

  try {
    // 1. Trouver ou créer un admin
    let admin = await User.findOne({ typeUtilisateur: 'ADMIN' });
    if (!admin) {
      console.log('Création d\'un admin...');
      admin = await User.create({
        prenom: 'Admin',
        nom: 'Yoon-Bi',
        email: 'admin@yoon-bi.sn',
        tel: '771234567',
        motDePasse: 'admin123',
        typeUtilisateur: 'ADMIN',
        actif: true
      });
      console.log('✓ Admin créé');
    }

    // 2. Trouver ou créer un chauffeur
    let chauffeur = await User.findOne({ typeUtilisateur: 'CHAUFFEUR', actif: true });
    if (!chauffeur) {
      console.log('Création d\'un chauffeur...');
      chauffeur = await User.create({
        prenom: 'Fatou',
        nom: 'Sall',
        email: 'fatou.sall@yoon-bi.sn',
        tel: '779876543',
        motDePasse: 'test123',
        typeUtilisateur: 'CHAUFFEUR',
        actif: true,
        statutValidation: 'VALIDE',
        numPermis: 'PERM-12345',
        dateValiditePermis: new Date('2026-12-31'),
        vehicule: {
          marque: 'Toyota',
          modele: 'Corolla',
          immatriculation: 'DK-1234-AB',
          typeVehicule: 'BERLINE',
          nombrePlaces: 4,
          couleur: 'Blanc'
        }
      });
      console.log('✓ Chauffeur créé');
    }

    // 3. Trouver ou créer un client
    let client = await User.findOne({ typeUtilisateur: 'CLIENT', actif: true });
    if (!client) {
      console.log('Création d\'un client...');
      client = await User.create({
        prenom: 'Moussa',
        nom: 'Diop',
        email: 'moussa.diop@yoon-bi.sn',
        tel: '775432109',
        motDePasse: 'test123',
        typeUtilisateur: 'CLIENT',
        actif: true
      });
      console.log('✓ Client créé');
    }

    // 4. Créer des trajets
    console.log('Création de trajets...');
    const trajets = [];
    const routes = [
      { depart: 'Dakar', arrivee: 'Thiès', prix: 2500 },
      { depart: 'Dakar', arrivee: 'Saint-Louis', prix: 5000 },
      { depart: 'Thiès', arrivee: 'Kaolack', prix: 3000 }
    ];

    for (const route of routes) {
      const trajet = await Trajet.create({
        chauffeur: chauffeur._id,
        depart: route.depart,
        arrivee: route.arrivee,
        dateDebut: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
        prixParPlace: route.prix,
        nbPlacesDisponibles: 3,
        nbPlacesTotal: 4,
        statut: 'TERMINE'
      });
      trajets.push(trajet);
    }
    console.log(`✓ ${trajets.length} trajets créés`);

    // 5. Créer des réservations
    console.log('Création de réservations...');
    const reservations = [];
    
    for (let i = 0; i < trajets.length; i++) {
      const trajet = trajets[i];
      const reservation = await Reservation.create({
        client: client._id,
        trajet: trajet._id,
        nbPlaces: 2,
        adresseDepart: trajet.depart,
        adresseArrivee: trajet.arrivee,
        montantTotal: trajet.prixParPlace * 2,
        etat: i === 0 ? 'CONFIRMEE' : 'TERMINEE' // Première en attente, autres terminées
      });
      reservations.push(reservation);
    }
    console.log(`✓ ${reservations.length} réservations créées`);

    // 6. Créer des paiements
    console.log('Création de paiements...');
    const paiements = [];
    
    for (let i = 0; i < reservations.length; i++) {
      const reservation = reservations[i];
      const paiement = await Paiement.create({
        reservation: reservation._id,
        montant: reservation.montantTotal,
        methode: 'MOBILE_MONEY',
        statut: i === 0 ? 'EN_ATTENTE' : 'SUCCESS', // Premier en attente, autres success
        detailsMethode: {
          numeroTelephone: client.tel,
          operateur: 'Wave'
        }
      });
      paiements.push(paiement);
    }
    console.log(`✓ ${paiements.length} paiements créés`);

    console.log('\n✅ Données de test créées avec succès !');
    
    return {
      admin,
      chauffeur,
      client,
      trajets,
      reservations,
      paiements
    };
  } catch (error) {
    console.error('✗ Erreur lors de la création des données:', error);
    throw error;
  }
}

async function testFinanceEndpoints() {
  console.log('\n🧪 Test des calculs financiers...\n');

  try {
    // Simuler ce que fait le contrôleur finance
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Total revenus
    const paiements = await Paiement.find({
      statut: 'SUCCESS',
      createdAt: { $gte: start, $lt: end }
    }).lean();

    const totalRevenue = paiements.reduce((s, p) => s + (p.montant || 0), 0);
    const commission = Math.round(totalRevenue * 0.15);
    const paidToDrivers = totalRevenue - commission;

    console.log('📊 Statistiques calculées:');
    console.log(`   Total revenus: ${totalRevenue} FCFA`);
    console.log(`   Commission (15%): ${commission} FCFA`);
    console.log(`   Versé aux chauffeurs: ${paidToDrivers} FCFA`);

    // En attente
    const pendingReservations = await Reservation.find({
      etat: 'CONFIRMEE',
      createdAt: { $lt: end }
    }).lean();
    const pendingValidation = pendingReservations.reduce((s, r) => s + (r.montantTotal || 0), 0);

    console.log(`   En attente validation: ${pendingValidation} FCFA`);

    // Trajets terminés
    const completedReservations = await Reservation.find({
      etat: 'TERMINEE',
      updatedAt: { $gte: start, $lt: end }
    }).lean();

    console.log(`   Trajets terminés: ${completedReservations.length}`);

    return {
      totalRevenue,
      commission,
      paidToDrivers,
      pendingValidation,
      completedTrips: completedReservations.length
    };
  } catch (error) {
    console.error('✗ Erreur lors du test:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Script de test des données financières\n');
  console.log('='.repeat(50));

  await connectDB();

  const stats = await checkData();

  // Si pas de données, en créer
  if (stats.paiementsCount === 0 || stats.reservationsCount === 0) {
    console.log('\n⚠️  Aucune donnée financière trouvée');
    console.log('Voulez-vous créer des données de test ? (Ctrl+C pour annuler)');
    
    // Attendre 3 secondes
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await createTestData();
    await checkData();
  }

  // Tester les calculs
  await testFinanceEndpoints();

  console.log('\n' + '='.repeat(50));
  console.log('✅ Script terminé avec succès !');
  console.log('\n💡 Vous pouvez maintenant tester la page Finance dans le frontend');
  
  await mongoose.connection.close();
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
