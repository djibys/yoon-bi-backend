# 📘 Documentation Swagger - Mise à jour complète

## Aperçu

La documentation Swagger a été mise à jour pour refléter toutes les nouvelles fonctionnalités de l'API Yoon-Bi v2.0.0.

## 🔗 Accès à la documentation

Une fois le serveur démarré:
- **Local**: http://localhost:3000/api-docs
- **Mobile**: http://192.168.1.23:3000/api-docs

## 🆕 Nouveautés dans la documentation

### 1. Configuration générale améliorée

**Version**: Mise à jour de 1.0.0 → 2.0.0

**Serveurs multiples**:
- Serveur local: `http://localhost:3000`
- Serveur mobile: `http://192.168.1.23:3000`

**Tags organisés**:
- Auth
- Trajets
- Réservations
- Paiements
- Évaluations
- Admin

### 2. Schémas de données définis

#### **User** (Utilisateur)
```json
{
  "id": "507f1f77bcf86cd799439011",
  "prenom": "Fatou",
  "nom": "Sall",
  "email": "fatou.sall@example.com",
  "tel": "771234567",
  "photo": "/uploads/profiles/12345-67890.jpg",
  "typeUtilisateur": "CHAUFFEUR",
  "noteEval": 4.5,
  "disponibilite": true,
  "vehicule": { ... }
}
```

#### **Vehicule**
```json
{
  "marque": "Toyota",
  "modele": "Corolla",
  "immatriculation": "DK-1234-AB",
  "typeVehicule": "Berline",
  "nombrePlaces": 4,
  "assurance": "12345-ASSUR",
  "couleur": "Blanc",
  "photo": "/uploads/vehicles/12345-67890.jpg"
}
```

#### **Trajet**, **Reservation**, **Error**
Tous les schémas principaux sont maintenant définis avec exemples.

### 3. Endpoints documentés en détail

#### ✅ **POST /api/auth/register**
- Description complète avec exemple CLIENT et CHAUFFEUR
- Tous les champs du véhicule documentés
- Aliases explicites (tel/telephone, motDePasse/password, etc.)
- Exemples de réponse succès et erreur

**Exemple complet d'inscription chauffeur**:
```json
{
  "prenom": "Fatou",
  "nom": "Sall",
  "email": "fatou.sall@example.com",
  "tel": "771234567",
  "motDePasse": "test123",
  "typeUtilisateur": "CHAUFFEUR",
  "numPermis": "PENDING",
  "dateValiditePermis": "2026-12-31",
  "vehicule": {
    "marque": "Toyota",
    "modele": "Corolla",
    "immatriculation": "DK-1234-AB",
    "typeVehicule": "Berline",
    "nombrePlaces": 4,
    "assurance": "12345-ASSUR"
  }
}
```

#### ✅ **POST /api/auth/login**
- Deux méthodes: connexion par email OU téléphone
- Exemples interactifs pour chaque méthode
- Réponses détaillées (succès, échec, compte désactivé)

**Exemples fournis**:
```json
// Par email
{
  "email": "fatou.sall@example.com",
  "motDePasse": "test123"
}

// Par téléphone
{
  "tel": "771234567",
  "motDePasse": "test123"
}
```

#### ✅ **GET /api/auth/me**
- Description du contenu retourné
- Schéma User complet avec véhicule

#### ✅ **POST /api/auth/upload/profile** ⭐ NOUVEAU
- Documentation complète de l'upload multipart/form-data
- Contraintes clairement définies:
  - Types: JPEG, PNG, GIF, WebP
  - Taille max: 5 MB
- **Exemple de code React Native** fourni dans Swagger
- Réponses avec URL de la photo

**Code d'exemple inclus**:
```javascript
const formData = new FormData();
formData.append('photo', {
  uri: imageUri,
  name: 'photo.jpg',
  type: 'image/jpeg'
});

fetch('http://API_URL/api/auth/upload/profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

#### ✅ **POST /api/auth/upload/vehicle** ⭐ NOUVEAU
- Upload réservé aux chauffeurs
- Documentation des restrictions d'accès
- Exemple de code React Native
- Codes d'erreur 403 pour clients

### 4. Compatibilité mobile documentée

**Aliases explicites dans Swagger**:

| Champ standard | Alias mobile | Usage |
|----------------|--------------|-------|
| `tel` | `telephone` | Numéro de téléphone |
| `motDePasse` | `password` | Mot de passe |
| `nombrePlaces` | `nbPlaces` | Nombre de places |
| `typeVehicule` | `typeClasse` | Type de véhicule |

Tous ces aliases sont acceptés par le backend et documentés dans Swagger.

### 5. Sécurité JWT

**Bearer Authentication** documentée:
- Schéma de sécurité défini
- Description: "Token JWT obtenu après connexion"
- Appliqué sur tous les endpoints protégés
- Bouton "Authorize" disponible dans Swagger UI

### 6. Exemples interactifs

Chaque endpoint dispose:
- ✅ D'exemples de requêtes
- ✅ D'exemples de réponses
- ✅ De codes d'erreur possibles
- ✅ De descriptions détaillées

## 📊 Comparaison avant/après

| Aspect | Avant | Après |
|--------|-------|-------|
| Version | 1.0.0 | 2.0.0 |
| Schémas définis | ❌ Aucun | ✅ User, Vehicule, Trajet, etc. |
| Upload photos | ❌ Non documenté | ✅ Entièrement documenté |
| Exemples de code | ❌ Aucun | ✅ Code React Native |
| Aliases mobile | ❌ Non mentionnés | ✅ Tous documentés |
| Contraintes | ❌ Minimales | ✅ Détaillées (tailles, types, etc.) |
| Serveurs | ✅ 1 (local) | ✅ 2 (local + mobile) |

## 🎯 Utilisation pratique

### 1. Explorer l'API

1. Démarrer le serveur: `npm run dev`
2. Ouvrir: http://localhost:3000/api-docs
3. Cliquer sur "Authorize" et entrer votre token JWT
4. Tester les endpoints directement depuis Swagger

### 2. Générer du code client

Swagger permet de générer automatiquement du code client:
- Cliquer sur un endpoint
- Télécharger le schéma OpenAPI
- Utiliser des outils comme `openapi-generator`

### 3. Tester les uploads

1. Obtenir un token via `/api/auth/login`
2. Cliquer sur "Authorize" et entrer le token
3. Aller sur `/api/auth/upload/profile`
4. Cliquer sur "Try it out"
5. Uploader un fichier image
6. Exécuter la requête

### 4. Copier les exemples de code

Les exemples React Native sont directement copiables depuis Swagger:
- Ouvrir un endpoint d'upload
- Scroller jusqu'à la section "Description"
- Copier le code JavaScript fourni

## 🔧 Personnalisation

Pour modifier la documentation Swagger:

### Fichier: `src/server.js`
- Configuration générale
- Schémas de données
- Serveurs disponibles

### Fichier: `src/routes/*.routes.js`
- Documentation spécifique à chaque endpoint
- Utiliser les annotations `@openapi`

**Exemple d'ajout de documentation**:
```javascript
/**
 * @openapi
 * /api/mon-endpoint:
 *   get:
 *     summary: Description courte
 *     description: Description détaillée
 *     tags: [MonTag]
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MonSchema'
 */
router.get('/mon-endpoint', handler);
```

## 📱 Intégration mobile

### URLs à utiliser

**Dans le `.env` mobile**:
```
EXPO_PUBLIC_API_URL=http://192.168.1.23:3000
```

**Pour les photos**:
```
http://192.168.1.23:3000/uploads/profiles/photo.jpg
http://192.168.1.23:3000/uploads/vehicles/photo.jpg
```

### Code généré depuis Swagger

Utiliser les exemples fournis dans Swagger pour:
- Upload de photos
- Authentification
- Gestion des trajets

## ✅ Checklist de vérification

- [✅] Swagger accessible sur `/api-docs`
- [✅] Tous les endpoints Auth documentés
- [✅] Schémas de données définis
- [✅] Exemples de requêtes fournis
- [✅] Code React Native inclus
- [✅] Contraintes d'upload spécifiées
- [✅] Aliases mobile documentés
- [✅] Sécurité JWT configurée
- [✅] Serveurs local et mobile listés
- [✅] Codes d'erreur documentés

## 🎉 Résultat

**Documentation Swagger 100% complète** incluant:
- ✅ Inscription client et chauffeur avec véhicule
- ✅ Connexion par email ou téléphone
- ✅ Upload de photos (profil et véhicule)
- ✅ Gestion des trajets et réservations
- ✅ Exemples de code prêts à l'emploi
- ✅ Interface interactive pour tester l'API

---

**Accès**: http://localhost:3000/api-docs ou http://192.168.1.23:3000/api-docs

**Version**: Yoon-Bi API v2.0.0
