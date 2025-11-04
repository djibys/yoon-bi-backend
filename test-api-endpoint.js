require('dotenv').config();
const http = require('http');

async function testEndpoint() {
  console.log('🔍 Test de l\'endpoint API de connexion\n');
  
  const testData = JSON.stringify({
    email: 'fatou@example.com',
    motDePasse: 'password123'
  });
  
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
  
  console.log('📡 Envoi de la requête:');
  console.log(`   URL: http://${options.hostname}:${options.port}${options.path}`);
  console.log(`   Method: ${options.method}`);
  console.log(`   Body:`, JSON.parse(testData));
  console.log('');
  
  const req = http.request(options, (res) => {
    console.log(`📥 Réponse reçue:`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Headers:`, res.headers);
    console.log('');
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Corps de la réponse:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
        
        if (res.statusCode === 200) {
          console.log('\n✅ SUCCÈS: La connexion fonctionne!');
          console.log('   Token reçu:', parsed.token ? 'Oui' : 'Non');
          console.log('   Utilisateur:', parsed.user ? `${parsed.user.prenom} ${parsed.user.nom}` : 'Non');
        } else {
          console.log('\n❌ ÉCHEC: Erreur de connexion');
          console.log('   Message:', parsed.message || 'Aucun message');
        }
      } catch (e) {
        console.log(data);
        console.log('\n⚠️  Réponse non-JSON reçue');
      }
      process.exit(res.statusCode === 200 ? 0 : 1);
    });
  });
  
  req.on('error', (error) => {
    console.error('\n❌ ERREUR DE CONNEXION:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('\n💡 Le serveur backend est-il démarré sur le port 3000?');
    console.error('   Commande: cd back/yoon-bi-backend && npm start');
    process.exit(1);
  });
  
  req.write(testData);
  req.end();
}

testEndpoint();
