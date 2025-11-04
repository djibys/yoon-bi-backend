# Yoon-Bi Backend API

Backend Node.js/Express + MongoDB pour l'application mobile de covoiturage Yoon-Bi.

## 🚀 Démarrage rapide

### Prérequis
- Node.js (v14 ou supérieur)
- MongoDB (installé et en cours d'exécution)
- npm ou yarn

### Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer MongoDB**
   
   Assurez-vous que MongoDB est installé et démarré:
   ```bash
   # Windows
   mongod
   
   # Linux/Mac
   sudo service mongod start
   ```

3. **Configurer les variables d'environnement**
   
   Le fichier `.env` est déjà configuré avec:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/yoonbi
   JWT_SECRET=yoonbi_secret_key_2025_super_secure_xyz123
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **Démarrer le serveur**
   ```bash
   # Mode développement (avec nodemon)
   npm run dev
   
   # Mode production
   npm start
   ```

## 📱 Configuration Mobile

Après le démarrage, le serveur affichera l'adresse IP locale:
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

Utilisez **URL Mobile** dans le fichier `.env` de l'application mobile:
```
EXPO_PUBLIC_API_URL=http://192.168.1.23:3000
```

## 📚 Documentation API

Documentation Swagger disponible sur: `http://localhost:3000/api-docs`

## 🔑 Endpoints principaux

### Authentification
- `POST /api/auth/register` - Inscription (client ou chauffeur)
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour profil
- `POST /api/auth/upload/profile` - Upload photo de profil
- `POST /api/auth/upload/vehicle` - Upload photo véhicule (chauffeur)

### Trajets
- `GET /api/trajets` - Liste des trajets
- `POST /api/trajets` - Créer un trajet (chauffeur)
- `GET /api/trajets/:id` - Détails d'un trajet
- `PUT /api/trajets/:id` - Modifier un trajet

### Réservations
- `POST /api/reservations` - Créer une réservation
- `GET /api/reservations` - Mes réservations
- `PUT /api/reservations/:id` - Modifier une réservation

## 📊 Modèles de données

### User (Client/Chauffeur)
```javascript
{
  prenom, nom, email, tel, motDePasse,
  typeUtilisateur: 'CLIENT' | 'CHAUFFEUR',
  // Pour chauffeurs uniquement:
  numPermis, dateValiditePermis,
  vehicule: {
    marque, modele, immatriculation,
    typeVehicule, nombrePlaces, assurance
  }
}
```

### Trajet
```javascript
{
  chauffeur: ObjectId,
  depart, arrivee, dateDebut,
  prixParPlace, nbPlacesDisponibles,
  statut: 'EN_ATTENTE' | 'VALIDE' | 'ANNULE' | 'TERMINE'
}
```

### Reservation
```javascript
{
  trajet: ObjectId,
  client: ObjectId,
  nbPlaces,
  prixTotal,
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE'
}
```

## 🧪 Tests

Fichiers de test inclus:
- `test-db-connection.js` - Test connexion MongoDB
- `test-api-endpoint.js` - Test endpoints API
- `test-login.js` - Test authentification
- `create-test-user.js` - Créer des utilisateurs de test

Exécuter un test:
```bash
node test-db-connection.js
```

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt
- Authentification JWT
- Protection CORS
- Helmet pour headers sécurisés
- Validation des données avec express-validator

## 🛠️ Structure du projet

```
yoon-bi-backend/
├── src/
│   ├── config/         # Configuration (database)
│   ├── controllers/    # Logique métier
│   ├── middleware/     # Auth, errors
│   ├── models/         # Modèles Mongoose
│   ├── routes/         # Routes Express
│   └── server.js       # Point d'entrée
├── .env                # Variables d'environnement
└── package.json
```

## 📝 Notes importantes

### Compatibilité mobile
Le backend accepte les alias suivants pour compatibilité:
- `telephone` ou `tel`
- `password` ou `motDePasse`
- `nombrePlaces` ou `nbPlaces`
- `typeClasse` ou `typeVehicule`

### Inscription chauffeur
Lors de l'inscription, tous les champs du véhicule sont requis:
- marque, modele, immatriculation
- typeVehicule/typeClasse
- nombrePlaces/nbPlaces
- assurance (optionnel)

### Validation des données
- Email: format valide
- Téléphone: numérique (9 chiffres pour mobile)
- Mot de passe: 6-8 caractères, lettres + chiffres
- Immatriculation: format DK-XXXX-XX

## 🐛 Dépannage

### MongoDB ne démarre pas
```bash
# Vérifier le statut
mongod --version

# Réparer si nécessaire
mongod --repair
```

### Port déjà utilisé
Modifier le PORT dans `.env` ou tuer le processus:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Mobile ne peut pas se connecter
1. Vérifier que le serveur écoute sur `0.0.0.0` ✅
2. Vérifier que PC et mobile sont sur le même réseau WiFi
3. Utiliser l'IP affichée au démarrage du serveur
4. Désactiver le pare-feu si nécessaire

## 📞 Support

Pour toute question ou problème, vérifier:
1. MongoDB est bien démarré
2. Les dépendances sont installées (`npm install`)
3. Le fichier `.env` est correct
4. Les logs du serveur pour les erreurs

---

**Version**: 1.0.0  
**License**: ISC