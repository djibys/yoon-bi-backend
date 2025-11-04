# 🚀 Guide de Démarrage - Yoon-Bi Backend

## Étape 1: Installer MongoDB

### Windows
1. Télécharger MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Installer avec les options par défaut
3. MongoDB démarre automatiquement comme service Windows

Vérifier l'installation:
```bash
mongod --version
```

### Alternative: MongoDB Compass (Interface graphique)
- Télécharger: https://www.mongodb.com/try/download/compass
- Connecter à: `mongodb://localhost:27017`
- Créer une base `yoonbi`

## Étape 2: Démarrer MongoDB

### Windows (service automatique)
MongoDB démarre automatiquement. Pour vérifier:
```bash
# Vérifier si MongoDB est en cours d'exécution
tasklist | findstr mongod
```

Si MongoDB n'est pas démarré:
```bash
# Démarrer le service
net start MongoDB
```

### Connexion manuelle (alternative)
```bash
# Dans un terminal séparé
cd C:\Program Files\MongoDB\Server\<version>\bin
mongod --dbpath C:\data\db
```

## Étape 3: Installer les dépendances Node.js

```bash
cd "c:\Users\hp\Desktop\projet fin\back\yoon-bi-backend"
npm install
```

## Étape 4: Configurer l'environnement

Le fichier `.env` est déjà configuré. Vérifier qu'il contient:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/yoonbi
JWT_SECRET=yoonbi_secret_key_2025_super_secure_xyz123
JWT_EXPIRE=7d
NODE_ENV=development
```

## Étape 5: Démarrer le serveur

```bash
# Mode développement (recommandé)
npm run dev

# OU mode production
npm start
```

Le serveur affichera:
```
╔═══════════════════════════════════════════════════════════╗
║         🚀 SERVEUR YOON-BI DÉMARRÉ AVEC SUCCÈS           ║
╠═══════════════════════════════════════════════════════════╣
║  Port:        3000                                        ║
║  Environment: development                                 ║
║  URL Local:   http://localhost:3000                       ║
║  URL Mobile:  http://192.168.1.23:3000                    ║
║  API Docs:    http://192.168.1.23:3000/api-docs          ║
╚═══════════════════════════════════════════════════════════╝
```

## Étape 6: Tester l'API

### Test 1: Vérifier que le serveur répond
Ouvrir dans un navigateur: `http://localhost:3000`

Vous devriez voir:
```json
{
  "message": "🚗 Bienvenue sur l'API Yoon-Bi",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### Test 2: Créer un utilisateur test

**Client:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"prenom\": \"Amadou\",
    \"nom\": \"Diop\",
    \"email\": \"amadou@test.com\",
    \"tel\": \"771234567\",
    \"motDePasse\": \"test123\",
    \"typeUtilisateur\": \"CLIENT\"
  }"
```

**Chauffeur:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"prenom\": \"Fatou\",
    \"nom\": \"Sall\",
    \"email\": \"fatou@test.com\",
    \"tel\": \"772345678\",
    \"motDePasse\": \"test123\",
    \"typeUtilisateur\": \"CHAUFFEUR\",
    \"numPermis\": \"PENDING\",
    \"dateValiditePermis\": \"2026-12-31\",
    \"vehicule\": {
      \"marque\": \"Toyota\",
      \"modele\": \"Corolla\",
      \"immatriculation\": \"DK-1234-AB\",
      \"typeVehicule\": \"Berline\",
      \"nombrePlaces\": 4,
      \"assurance\": \"12345-ASSUR\"
    }
  }"
```

### Test 3: Se connecter
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"amadou@test.com\",
    \"motDePasse\": \"test123\"
  }"
```

Vous recevrez un token JWT à utiliser pour les requêtes protégées.

## Étape 7: Configurer l'application mobile

Dans le fichier `.env` de l'app mobile:
```
EXPO_PUBLIC_API_URL=http://192.168.1.23:3000
```

⚠️ **Important**: Remplacer `192.168.1.23` par l'IP affichée au démarrage du serveur.

## 📊 Vérifier la base de données

### Avec MongoDB Compass
1. Ouvrir MongoDB Compass
2. Connecter à `mongodb://localhost:27017`
3. Ouvrir la base `yoonbi`
4. Voir les collections: `users`, `trajets`, `reservations`, etc.

### En ligne de commande
```bash
# Se connecter à MongoDB
mongosh

# Utiliser la base yoonbi
use yoonbi

# Voir les utilisateurs
db.users.find().pretty()

# Compter les utilisateurs
db.users.countDocuments()
```

## 🧪 Tests disponibles

```bash
# Tester la connexion MongoDB
node test-db-connection.js

# Tester les endpoints API
node test-api-endpoint.js

# Tester la connexion
node test-login.js

# Créer des utilisateurs de test
node create-test-user.js
```

## 🐛 Problèmes courants

### "MongoDB ne démarre pas"
```bash
# Vérifier l'installation
mongod --version

# Vérifier le service (Windows)
net start MongoDB

# Vérifier les logs
# Windows: C:\Program Files\MongoDB\Server\<version>\log\mongod.log
```

### "Port 3000 déjà utilisé"
```bash
# Trouver le processus
netstat -ano | findstr :3000

# Tuer le processus
taskkill /PID <PID> /F

# OU changer le port dans .env
PORT=3001
```

### "Cannot connect from mobile"
1. ✅ Vérifier que PC et mobile sont sur le même WiFi
2. ✅ Utiliser l'IP affichée au démarrage (pas localhost)
3. ✅ Désactiver temporairement le pare-feu Windows
4. ✅ Redémarrer le serveur après modification du .env

### "Database connection error"
```bash
# Vérifier que MongoDB est démarré
tasklist | findstr mongod

# Si nécessaire, réparer la DB
mongod --repair --dbpath C:\data\db
```

## 📱 Test depuis Postman

1. Télécharger Postman: https://www.postman.com/downloads/
2. Importer la collection (créer les requêtes):
   - POST `http://localhost:3000/api/auth/register`
   - POST `http://localhost:3000/api/auth/login`
   - GET `http://localhost:3000/api/auth/me` (avec header `Authorization: Bearer <token>`)

## ✅ Checklist finale

- [ ] MongoDB installé et démarré
- [ ] `npm install` exécuté sans erreurs
- [ ] Serveur démarre sur port 3000
- [ ] `http://localhost:3000` retourne JSON
- [ ] Inscription client fonctionne
- [ ] Inscription chauffeur avec véhicule fonctionne
- [ ] Connexion retourne un token
- [ ] IP locale affichée au démarrage
- [ ] App mobile configurée avec la bonne IP

## 🎉 Prêt!

Votre backend est maintenant opérationnel! Vous pouvez:
- Tester l'inscription depuis l'app mobile
- Consulter la doc Swagger: `http://localhost:3000/api-docs`
- Voir les données dans MongoDB Compass

---

**Support**: Vérifier les logs du serveur en cas de problème.
