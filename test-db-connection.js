require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function testConnection() {
  try {
    console.log('🔄 Tentative de connexion à MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion MongoDB réussie!');
    console.log('📊 Base de données:', mongoose.connection.name);
    
    const userCount = await User.countDocuments();
    console.log(`👥 Nombre d'utilisateurs dans la base: ${userCount}`);
    
    if (userCount === 0) {
      console.log('\n⚠️  Aucun utilisateur trouvé. Création d\'un utilisateur de test...');
      
      const testUser = await User.create({
        prenom: 'Test',
        nom: 'Chauffeur',
        email: 'test@test.com',
        tel: '221771234567',
        motDePasse: 'test123',
        typeUtilisateur: 'CHAUFFEUR',
        numPermis: 'TEST123',
        dateValiditePermis: new Date('2025-12-31')
      });
      
      console.log('✅ Utilisateur de test créé:');
      console.log('   Email: test@test.com');
      console.log('   Téléphone: 221771234567');
      console.log('   Mot de passe: test123');
      console.log('   Type: CHAUFFEUR');
    } else {
      console.log('\n📋 Liste des utilisateurs:');
      const users = await User.find().select('prenom nom email tel typeUtilisateur');
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.prenom} ${user.nom}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Tél: ${user.tel}`);
        console.log(`   Type: ${user.typeUtilisateur}`);
      });
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Test terminé avec succès!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testConnection();
