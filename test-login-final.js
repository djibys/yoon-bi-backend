require('dotenv').config();
const http = require('http');

async function testLogin(email, tel, password, description) {
  return new Promise((resolve, reject) => {
    const testData = JSON.stringify(
      email ? { email, motDePasse: password } : { tel, motDePasse: password }
    );
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
      }
    };
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Test: ${description}`);
    console.log(`${'='.repeat(60)}`);
    console.log('📡 Requête:');
    console.log(`   Identifiant: ${email || tel}`);
    console.log(`   Mot de passe: ${password}`);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('\n✅ SUCCÈS!');
            console.log(`   Token: ${parsed.token.substring(0, 20)}...`);
            console.log(`   Utilisateur: ${parsed.user.prenom} ${parsed.user.nom}`);
            console.log(`   Type: ${parsed.user.typeUtilisateur}`);
            console.log(`   Email: ${parsed.user.email}`);
            resolve(true);
          } else {
            console.log('\n❌ ÉCHEC');
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Message: ${parsed.message}`);
            resolve(false);
          }
        } catch (e) {
          console.log('\n⚠️  Erreur de parsing:', e.message);
          console.log('   Réponse brute:', data);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('\n❌ ERREUR DE CONNEXION:', error.message);
      console.error('💡 Vérifiez que le serveur backend est démarré!');
      resolve(false);
    });
    
    req.write(testData);
    req.end();
  });
}

async function runAllTests() {
  console.log('\n🔍 TESTS DE CONNEXION - YOON-BI');
  console.log('='.repeat(60));
  
  const tests = [
    { email: 'test@yoonbi.com', tel: null, password: 'test123', desc: 'Client avec email' },
    { email: null, tel: '221777777777', password: 'test123', desc: 'Client avec téléphone' },
    { email: 'chauffeur@yoonbi.com', tel: null, password: 'test123', desc: 'Chauffeur avec email' },
    { email: null, tel: '221788888888', password: 'test123', desc: 'Chauffeur avec téléphone' },
    { email: 'test@yoonbi.com', tel: null, password: 'wrong', desc: 'Mauvais mot de passe (doit échouer)' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testLogin(test.email, test.tel, test.password, test.desc);
    if (result) passed++;
    else failed++;
    await new Promise(resolve => setTimeout(resolve, 500)); // Pause entre les tests
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  console.log(`✅ Réussis: ${passed}`);
  console.log(`❌ Échoués: ${failed}`);
  console.log(`📈 Total: ${tests.length}`);
  
  if (passed >= 4) {
    console.log('\n🎉 L\'API de connexion fonctionne correctement!');
    console.log('\n💡 Utilisez ces identifiants dans votre app mobile:');
    console.log('   Email: test@yoonbi.com');
    console.log('   Mot de passe: test123');
  } else {
    console.log('\n⚠️  Des problèmes ont été détectés.');
  }
  
  process.exit(0);
}

runAllTests();
