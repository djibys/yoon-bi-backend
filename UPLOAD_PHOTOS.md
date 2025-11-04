# 📸 Guide Upload de Photos - Yoon-Bi

## Backend - Configuration

### Dossiers créés automatiquement
Le backend crée automatiquement les dossiers nécessaires:
```
uploads/
├── profiles/    # Photos de profil utilisateur
└── vehicles/    # Photos de véhicule (chauffeurs)
```

### Endpoints disponibles

#### 1. Upload photo de profil
```
POST /api/auth/upload/profile
Headers: Authorization: Bearer <token>
Body: multipart/form-data
  - photo: fichier image (JPEG, PNG, GIF, WebP)
```

**Réponse:**
```json
{
  "success": true,
  "message": "Photo de profil mise à jour",
  "photo": "/uploads/profiles/12345-67890.jpg",
  "user": { ... }
}
```

#### 2. Upload photo de véhicule (chauffeurs uniquement)
```
POST /api/auth/upload/vehicle
Headers: Authorization: Bearer <token>
Body: multipart/form-data
  - photo: fichier image (JPEG, PNG, GIF, WebP)
```

**Réponse:**
```json
{
  "success": true,
  "message": "Photo de véhicule mise à jour",
  "photo": "/uploads/vehicles/12345-67890.jpg",
  "user": { ... }
}
```

### Contraintes
- **Taille max**: 5 MB par fichier
- **Types acceptés**: JPEG, JPG, PNG, GIF, WebP
- **Authentification**: Token JWT requis
- **Permissions**: Seuls les chauffeurs peuvent uploader une photo de véhicule

### Accès aux photos
Les photos sont accessibles via:
```
http://192.168.1.23:3000/uploads/profiles/photo.jpg
http://192.168.1.23:3000/uploads/vehicles/photo.jpg
```

---

## Mobile - Utilisation

### 1. Installer expo-image-picker
```bash
npx expo install expo-image-picker
```

### 2. Importer le service d'upload
```typescript
import { uploadPhoto, getPhotoUrl } from '../services/upload';
```

### 3. Exemple d'upload de photo de profil

```typescript
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto } from '../services/upload';

const handleUploadProfilePhoto = async () => {
  try {
    // 1. Demander permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Impossible d\'accéder à la galerie');
      return;
    }

    // 2. Sélectionner une image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Carré pour photo de profil
      quality: 0.8,
    });

    if (result.canceled) return;

    // 3. Uploader
    const uri = result.assets[0].uri;
    const response = await uploadPhoto(uri, token, 'profile');
    
    Alert.alert('Succès', 'Photo de profil mise à jour!');
    console.log('Photo URL:', response.photo);
    
  } catch (error: any) {
    Alert.alert('Erreur', error.message);
  }
};
```

### 4. Exemple d'upload de photo de véhicule

```typescript
const handleUploadVehiclePhoto = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Impossible d\'accéder à la galerie');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // Format paysage pour véhicule
      quality: 0.7,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    const response = await uploadPhoto(uri, token, 'vehicle');
    
    Alert.alert('Succès', 'Photo du véhicule mise à jour!');
    setVehiclePhotoUrl(response.photo);
    
  } catch (error: any) {
    Alert.alert('Erreur', error.message);
  }
};
```

### 5. Afficher une photo uploadée

```typescript
import { Image } from 'react-native';
import { getPhotoUrl } from '../services/upload';

// Dans le composant
const photoUrl = getPhotoUrl(user.photo);

return (
  <View>
    {photoUrl ? (
      <Image 
        source={{ uri: photoUrl }}
        style={{ width: 100, height: 100, borderRadius: 50 }}
      />
    ) : (
      <View style={{ width: 100, height: 100, backgroundColor: '#ccc' }} />
    )}
  </View>
);
```

### 6. Exemple complet dans EditProfil.tsx

```typescript
import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto, getPhotoUrl } from '../services/upload';

export default function EditProfil({ token }) {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const handlePickAndUpload = async () => {
    try {
      // Sélection
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      // Upload
      setUploading(true);
      const uri = result.assets[0].uri;
      const response = await uploadPhoto(uri, token, 'profile');
      
      setPhotoUrl(response.photo);
      Alert.alert('Succès', 'Photo mise à jour!');
      
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handlePickAndUpload}>
        {uploading ? (
          <ActivityIndicator size="large" />
        ) : photoUrl ? (
          <Image 
            source={{ uri: getPhotoUrl(photoUrl)! }}
            style={{ width: 120, height: 120, borderRadius: 60 }}
          />
        ) : (
          <View style={{ width: 120, height: 120, backgroundColor: '#ccc', borderRadius: 60 }} />
        )}
      </TouchableOpacity>
    </View>
  );
}
```

---

## Test avec Postman

### 1. Obtenir un token
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "email": "user@test.com",
  "motDePasse": "test123"
}

Response: { "token": "eyJhbGc..." }
```

### 2. Upload une photo
```
POST http://localhost:3000/api/auth/upload/profile
Headers:
  Authorization: Bearer eyJhbGc...

Body (form-data):
  photo: [Sélectionner un fichier image]
```

---

## Gestion des erreurs

### Erreurs courantes

**"Aucun fichier fourni"**
- Vérifier que le champ s'appelle bien "photo"
- Vérifier que le FormData est correctement construit

**"Seules les images sont autorisées"**
- Vérifier l'extension du fichier
- Types acceptés: .jpg, .jpeg, .png, .gif, .webp

**"Le fichier est trop volumineux"**
- Taille max: 5 MB
- Compresser l'image avec `quality: 0.7` dans ImagePicker

**"Non autorisé"**
- Vérifier que le token est valide
- Pour upload véhicule: vérifier que l'utilisateur est un CHAUFFEUR

---

## Sécurité

✅ **Authentification requise**: Toutes les routes nécessitent un token JWT

✅ **Validation du type**: Seules les images sont acceptées

✅ **Limitation de taille**: 5 MB maximum

✅ **Nommage unique**: Les fichiers sont renommés automatiquement avec un timestamp

✅ **Permissions**: Upload véhicule réservé aux chauffeurs

---

## Nettoyage des anciennes photos (à implémenter)

Pour supprimer les anciennes photos lors d'un nouvel upload:

```javascript
const fs = require('fs');
const path = require('path');

// Dans le controller, avant de sauvegarder la nouvelle photo
if (user.photo && user.photo !== 'default-avatar.png') {
  const oldPhotoPath = path.join(__dirname, '../../', user.photo);
  if (fs.existsSync(oldPhotoPath)) {
    fs.unlinkSync(oldPhotoPath);
  }
}
```

---

**Documentation complète**: Voir `README.md` pour plus d'informations sur l'API.
