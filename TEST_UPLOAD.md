# 🧪 Test Upload de Photos - Guide Rapide

## Prérequis
1. Backend démarré: `npm run dev`
2. MongoDB en cours d'exécution
3. Un utilisateur créé et un token JWT obtenu

---

## Étape 1: Installer multer (si pas fait)

```bash
cd "c:\Users\hp\Desktop\projet fin\back\yoon-bi-backend"
npm install
```

---

## Étape 2: Vérifier la structure des dossiers

Après le premier démarrage, ces dossiers sont créés automatiquement:
```
yoon-bi-backend/
└── uploads/
    ├── profiles/    # Photos de profil
    └── vehicles/    # Photos de véhicule
```

---

## Étape 3: Obtenir un token JWT

### Via curl (Windows CMD):
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@test.com\",\"motDePasse\":\"test123\"}"
```

### Via Postman:
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "email": "test@test.com",
  "motDePasse": "test123"
}
```

**Sauvegarder le token** retourné dans la réponse:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

## Étape 4: Upload photo de profil

### Via Postman (Recommandé):
1. **Requête**: `POST http://localhost:3000/api/auth/upload/profile`
2. **Headers**:
   - `Authorization`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **Body**: Sélectionner `form-data`
   - Clé: `photo` (changer le type en "File")
   - Valeur: Sélectionner une image (JPEG, PNG, etc.)
4. **Send**

### Réponse attendue:
```json
{
  "success": true,
  "message": "Photo de profil mise à jour",
  "photo": "/uploads/profiles/12345-1698765432.jpg",
  "user": {
    "id": "...",
    "prenom": "...",
    "photo": "/uploads/profiles/12345-1698765432.jpg"
  }
}
```

---

## Étape 5: Vérifier la photo uploadée

### Dans le navigateur:
```
http://localhost:3000/uploads/profiles/12345-1698765432.jpg
```

### Dans l'explorateur Windows:
```
c:\Users\hp\Desktop\projet fin\back\yoon-bi-backend\uploads\profiles\
```

---

## Étape 6: Upload photo de véhicule (chauffeurs uniquement)

### Via Postman:
1. **Requête**: `POST http://localhost:3000/api/auth/upload/vehicle`
2. **Headers**:
   - `Authorization`: `Bearer <token_chauffeur>`
3. **Body**: `form-data`
   - Clé: `photo` (File)
   - Valeur: Image du véhicule
4. **Send**

### Réponse:
```json
{
  "success": true,
  "message": "Photo de véhicule mise à jour",
  "photo": "/uploads/vehicles/12345-1698765999.jpg",
  "user": {
    "vehicule": {
      "photo": "/uploads/vehicles/12345-1698765999.jpg",
      "marque": "Toyota",
      ...
    }
  }
}
```

---

## Étape 7: Test depuis l'application mobile

### 1. Créer un bouton d'upload dans EditProfil.tsx:

```typescript
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto } from '../services/upload';

const handleUploadPhoto = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    try {
      const response = await uploadPhoto(
        result.assets[0].uri,
        token,
        'profile'
      );
      console.log('Photo uploadée:', response.photo);
      Alert.alert('Succès', 'Photo mise à jour!');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  }
};
```

### 2. Afficher la photo:
```typescript
import { Image } from 'react-native';
import { getPhotoUrl } from '../services/upload';

<Image 
  source={{ uri: getPhotoUrl(user.photo) }}
  style={{ width: 100, height: 100, borderRadius: 50 }}
/>
```

---

## Erreurs courantes et solutions

### ❌ "Aucun fichier fourni"
**Solution**: Vérifier que le champ s'appelle bien `photo` dans le FormData

### ❌ "Seules les images sont autorisées"
**Solution**: Uploader un fichier .jpg, .jpeg, .png, .gif ou .webp

### ❌ "Le fichier est trop volumineux"
**Solution**: Compresser l'image (max 5 MB)

### ❌ "Non autorisé"
**Solution**: Vérifier que le token JWT est valide et présent dans le header

### ❌ "Seuls les chauffeurs peuvent uploader une photo de véhicule"
**Solution**: Se connecter avec un compte chauffeur

### ❌ Photo ne s'affiche pas
**Solution**: Vérifier l'URL complète:
- Backend: `http://192.168.1.23:3000/uploads/profiles/photo.jpg`
- Utiliser `getPhotoUrl()` du service upload

---

## Vérification finale

### ✅ Checklist:
- [ ] Backend démarré sur port 3000
- [ ] Dossier `uploads/` créé
- [ ] Token JWT obtenu
- [ ] Photo uploadée via Postman
- [ ] Photo visible dans le navigateur
- [ ] Photo visible dans uploads/profiles/ ou uploads/vehicles/
- [ ] Service upload.ts copié dans le projet mobile
- [ ] Test upload depuis mobile réussi

---

## Exemples de tests complets

### Test 1: Créer un chauffeur et uploader photo véhicule

```bash
# 1. Inscription chauffeur
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"prenom\":\"Fatou\",\"nom\":\"Sall\",\"email\":\"fatou@test.com\",\"tel\":\"771234567\",\"motDePasse\":\"test123\",\"typeUtilisateur\":\"CHAUFFEUR\",\"numPermis\":\"PENDING\",\"dateValiditePermis\":\"2026-12-31\",\"vehicule\":{\"marque\":\"Toyota\",\"modele\":\"Corolla\",\"immatriculation\":\"DK-1234-AB\",\"typeVehicule\":\"Berline\",\"nombrePlaces\":4}}"

# 2. Login
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"fatou@test.com\",\"motDePasse\":\"test123\"}"

# 3. Upload photo véhicule (avec Postman car multipart)
# POST http://localhost:3000/api/auth/upload/vehicle
# Authorization: Bearer <token>
# Body (form-data): photo = <fichier image>
```

### Test 2: Upload depuis mobile

Voir le fichier `DriverSignup.tsx` ligne 348 pour l'implémentation existante de sélection d'image.

Pour uploader après inscription:
```typescript
// Après que l'utilisateur soit inscrit et ait un token
if (vehiclePhotoUri && token) {
  try {
    await uploadPhoto(vehiclePhotoUri, token, 'vehicle');
  } catch (error) {
    console.log('Upload photo failed:', error);
  }
}
```

---

**Documentation complète**: Voir `UPLOAD_PHOTOS.md` pour plus de détails.
