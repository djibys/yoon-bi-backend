# 🧪 Tests des Signalements

## ✅ Backend Mis à Jour

Les endpoints suivants sont maintenant disponibles:

### **POST /api/signalements**
Créer un nouveau signalement (CLIENT ou CHAUFFEUR)

### **GET /api/signalements/mes-signalements**
Récupérer mes signalements

---

## 📡 Tests avec Thunder Client / Postman

### **Test 1: Créer un signalement (Client)**

```http
POST http://localhost:3000/api/signalements
Headers:
  Authorization: Bearer YOUR_CLIENT_TOKEN
  Content-Type: application/json

Body:
{
  "type": "RETARD",
  "description": "Le chauffeur avait 30 minutes de retard sans prévenir. J'ai dû attendre au soleil.",
  "trajetId": "69081a257cc2fd9eb6598814",
  "reservationId": "690820f47cc2fd9eb6598820"
}

Réponse attendue (201):
{
  "success": true,
  "message": "Signalement créé avec succès",
  "signalement": {
    "id": "6728f1a2b3c4d5e6f7890123",
    "type": "RETARD",
    "description": "Le chauffeur avait 30 minutes de retard...",
    "trajet": {
      "_id": "69081a257cc2fd9eb6598814",
      "depart": "Dakar",
      "arrivee": "Thiès",
      "dateDebut": "2025-12-22T14:00:00.000Z"
    },
    "signaleParType": "CLIENT",
    "status": "EN_ATTENTE",
    "createdAt": "2025-11-03T15:30:00.000Z"
  }
}
```

### **Test 2: Créer un signalement (Chauffeur)**

```http
POST http://localhost:3000/api/signalements
Headers:
  Authorization: Bearer YOUR_CHAUFFEUR_TOKEN
  Content-Type: application/json

Body:
{
  "type": "COMPORTEMENT",
  "description": "Le client était impoli et a refusé de respecter les règles du véhicule.",
  "trajetId": "69081a257cc2fd9eb6598814",
  "reservationId": "690820f47cc2fd9eb6598820"
}

Réponse attendue (201):
{
  "success": true,
  "message": "Signalement créé avec succès",
  "signalement": {
    "id": "6728f1a2b3c4d5e6f7890124",
    "type": "COMPORTEMENT",
    "description": "Le client était impoli...",
    "signaleParType": "CHAUFFEUR",
    "status": "EN_ATTENTE",
    "createdAt": "2025-11-03T15:35:00.000Z"
  }
}
```

### **Test 3: Récupérer mes signalements**

```http
GET http://localhost:3000/api/signalements/mes-signalements
Headers:
  Authorization: Bearer YOUR_TOKEN

Réponse attendue (200):
{
  "success": true,
  "count": 2,
  "signalements": [
    {
      "id": "6728f1a2b3c4d5e6f7890124",
      "type": "COMPORTEMENT",
      "description": "Le client était impoli...",
      "status": "EN_ATTENTE",
      "trajet": {
        "_id": "69081a257cc2fd9eb6598814",
        "depart": "Dakar",
        "arrivee": "Thiès"
      },
      "createdAt": "2025-11-03T15:35:00.000Z"
    },
    {
      "id": "6728f1a2b3c4d5e6f7890123",
      "type": "RETARD",
      "description": "Le chauffeur avait 30 minutes...",
      "status": "RESOLU",
      "trajet": {
        "_id": "69081a257cc2fd9eb6598812",
        "depart": "Thiès",
        "arrivee": "Saint-Louis"
      },
      "createdAt": "2025-10-15T10:20:00.000Z"
    }
  ]
}
```

### **Test 4: Validation - Champs requis**

```http
POST http://localhost:3000/api/signalements
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json

Body:
{
  "type": "RETARD"
  // Manque description et trajetId
}

Réponse attendue (400):
{
  "success": false,
  "message": "Type, description et trajetId sont requis"
}
```

### **Test 5: Validation - Description trop longue**

```http
POST http://localhost:3000/api/signalements
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json

Body:
{
  "type": "RETARD",
  "description": "Lorem ipsum dolor sit amet... (plus de 500 caractères)",
  "trajetId": "69081a257cc2fd9eb6598814"
}

Réponse attendue (400):
{
  "success": false,
  "message": "La description ne doit pas dépasser 500 caractères"
}
```

### **Test 6: Trajet inexistant**

```http
POST http://localhost:3000/api/signalements
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json

Body:
{
  "type": "RETARD",
  "description": "Test avec trajet inexistant",
  "trajetId": "000000000000000000000000"
}

Réponse attendue (404):
{
  "success": false,
  "message": "Trajet non trouvé"
}
```

---

## 🔧 Démarrage du Serveur

```bash
cd "c:\Users\hp\Desktop\projet fin\back\yoon-bi-backend"
npm start
```

Ou utilisez le batch file:
```bash
start-backend.bat
```

Le serveur démarre sur: **http://localhost:3000**

---

## 📊 Vérification MongoDB

Vous pouvez vérifier les signalements dans MongoDB:

```javascript
// Dans MongoDB Compass ou mongo shell
use yoonbi

// Voir tous les signalements
db.reports.find().pretty()

// Voir les signalements EN_ATTENTE
db.reports.find({ status: "EN_ATTENTE" }).pretty()

// Voir les signalements par type
db.reports.find({ type: "RETARD" }).pretty()

// Compter les signalements
db.reports.countDocuments()
```

---

## 🧪 Tests depuis l'App Mobile

1. **Lancez le backend:**
   ```bash
   cd back\yoon-bi-backend
   npm start
   ```

2. **Lancez l'app mobile:**
   ```bash
   cd mobile\Yoon-bi-chauffeur-client\yoon-bi
   npx expo start
   ```

3. **Testez dans l'app:**
   - Connectez-vous comme CLIENT
   - Allez dans "Mes réservations" → "Validés"
   - Cliquez "⚠️ Signaler" sur un trajet
   - Remplissez le formulaire
   - Envoyez

4. **Vérifiez les logs:**
   ```
   Console Backend:
   [createSignalement] Signalement créé: 6728f1a2... par CLIENT

   Console Mobile:
   [ReportScreen] Envoi du signalement...
   [createSignalement] Signalement créé: {...}
   ```

---

## 🎯 Types de Signalements

| Type | Description | Utilisé par |
|------|-------------|-------------|
| `RETARD` | Retard important | Client → Chauffeur |
| `ANNULATION` | Annulation dernière minute | Client ↔ Chauffeur |
| `COMPORTEMENT` | Comportement inapproprié | Client ↔ Chauffeur |
| `VEHICULE` | Problème véhicule | Client → Chauffeur |
| `TRAJET_MODIFIE` | Trajet modifié sans accord | Client → Chauffeur |
| `SECURITE` | Problème de sécurité | Client ↔ Chauffeur |
| `AUTRE` | Autre problème | Client ↔ Chauffeur |

---

## 🔒 Sécurité Implémentée

✅ **Authentification requise** (middleware `protect`)  
✅ **Validation des données**  
✅ **Vérification du trajet**  
✅ **Détection automatique CLIENT/CHAUFFEUR**  
✅ **Limite de 500 caractères**  
✅ **Status EN_ATTENTE par défaut**  

---

## 📈 Statistiques Admin

Les ADMIN peuvent voir tous les signalements via:
```http
GET http://localhost:3000/api/admin/reports
Headers:
  Authorization: Bearer ADMIN_TOKEN
```

---

## ✅ Checklist Validation

- [x] Modèle Report mis à jour
- [x] Contrôleur avec createSignalement
- [x] Contrôleur avec getMesSignalements
- [x] Routes /api/signalements créées
- [x] Intégration dans server.js
- [x] Documentation Swagger
- [x] Tests unitaires définis

**Backend prêt pour recevoir les signalements ! 🚀**
