require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createTestUser() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté!\n');
    
    // Supprimer l'utilisateur de test s'il existe déjà
    await User.deleteOne({ email: 'test@yoonbi.com' });
    
    console.log('📝 Création d\'un utilisateur de test CLIENT...');
    const testClient = await User.create({
      prenom: 'Test',
      nom: 'Client',
      email: 'test@yoonbi.com',
      tel: '221777777777',
      motDePasse: 'test123',
      typeUtilisateur: 'CLIENT'
    });
    
    console.log('✅ Utilisateur CLIENT créé avec succès!');
    console.log('   📧 Email: test@yoonbi.com');
    console.log('   📱 Tel: 221777777777');
    console.log('   🔐 Mot de passe: test123');
    console.log('   👤 Type: CLIENT');
    console.log('   🆔 ID:', testClient._id);
    
    // Supprimer l'utilisateur chauffeur de test s'il existe déjà
    await User.deleteOne({ email: 'chauffeur@yoonbi.com' });
    
    console.log('\n📝 Création d\'un utilisateur de test CHAUFFEUR...');
    const testChauffeur = await User.create({
      prenom: 'Test',
      nom: 'Chauffeur',
      email: 'chauffeur@yoonbi.com',
      tel: '221788888888',
      motDePasse: 'test123',
      typeUtilisateur: 'CHAUFFEUR',
      numPermis: 'TEST123456',
      dateValiditePermis: new Date('2026-12-31'),
      vehicule: {
        typeVehicule: 'BERLINE',
        marque: 'Toyota',
        modele: 'Corolla',
        immatriculation: 'DK-1234-AB',
        couleur: 'Noir',
        nbPlaces: 4
      }
    });
    
    console.log('✅ Utilisateur CHAUFFEUR créé avec succès!');
    console.log('   📧 Email: chauffeur@yoonbi.com');
    console.log('   📱 Tel: 221788888888');
    console.log('   🔐 Mot de passe: test123');
    console.log('   👤 Type: CHAUFFEUR');
    console.log('   🆔 ID:', testChauffeur._id);
    
    console.log('\n\n🎯 RÉSUMÉ - Utilisateurs de test créés:');
    console.log('═'.repeat(50));
    console.log('\n1️⃣  CLIENT');
    console.log('   Email: test@yoonbi.com');
    console.log('   Tel: 221777777777');
    console.log('   Mot de passe: test123');
    console.log('\n2️⃣  CHAUFFEUR');
    console.log('   Email: chauffeur@yoonbi.com');
    console.log('   Tel: 221788888888');
    console.log('   Mot de passe: test123');
    console.log('\n═'.repeat(50));
    console.log('\n💡 Vous pouvez maintenant vous connecter avec ces identifiants!');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    if (error.code === 11000) {
      console.error('⚠️  Un utilisateur avec cet email existe déjà');
    }
    process.exit(1);
  }
}

createTestUser();
