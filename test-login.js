require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function testLogin() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté!\n');
    
    const testCases = [
      { email: 'fatou@example.com', tel: null, desc: 'Client (email)' },
      { email: null, tel: '774962502', desc: 'Client (tel)' },
      { email: 'chauffeur@example.com', tel: null, desc: 'Chauffeur (email)' },
      { email: null, tel: '+221770000002', desc: 'Chauffeur (tel)' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📝 Test: ${testCase.desc}`);
      console.log(`   Recherche: ${testCase.email ? 'email=' + testCase.email : 'tel=' + testCase.tel}`);
      
      const query = testCase.email ? { email: testCase.email } : { tel: testCase.tel };
      const user = await User.findOne(query).select('+motDePasse');
      
      if (!user) {
        console.log('   ❌ Utilisateur non trouvé');
        continue;
      }
      
      console.log(`   ✅ Utilisateur trouvé: ${user.prenom} ${user.nom}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📱 Tel: ${user.tel}`);
      console.log(`   👤 Type: ${user.typeUtilisateur}`);
      console.log(`   🔐 Mot de passe hashé: ${user.motDePasse ? 'Oui' : 'Non'}`);
      console.log(`   ✅ Actif: ${user.actif}`);
      
      if (user.typeUtilisateur === 'CHAUFFEUR') {
        console.log(`   📋 Statut validation: ${user.statutValidation}`);
      }
    }
    
    console.log('\n\n📋 Résumé des utilisateurs disponibles pour test:');
    const allUsers = await User.find().select('email tel typeUtilisateur actif');
    allUsers.forEach((u, i) => {
      console.log(`\n${i + 1}. ${u.typeUtilisateur}`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Tel: ${u.tel}`);
      console.log(`   Actif: ${u.actif}`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Test terminé!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

testLogin();
