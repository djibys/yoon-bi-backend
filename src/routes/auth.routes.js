const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, updateProfile, updatePassword, forgotPassword, resetPassword, adminUpdateUser, adminBlockChauffeur, adminUnblockChauffeur, uploadProfilePhoto, uploadVehiclePhoto } = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentification et gestion de session
 */
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Inscription utilisateur (Client ou Chauffeur)
 *     description: Créer un nouveau compte utilisateur. Pour un chauffeur, les informations du véhicule sont requises.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prenom
 *               - nom
 *               - email
 *               - tel
 *               - motDePasse
 *               - typeUtilisateur
 *             properties:
 *               prenom:
 *                 type: string
 *                 example: Fatou
 *               nom:
 *                 type: string
 *                 example: Sall
 *               email:
 *                 type: string
 *                 format: email
 *                 example: fatou.sall@example.com
 *               tel:
 *                 type: string
 *                 description: Numéro de téléphone (9 chiffres)
 *                 example: "771234567"
 *               telephone:
 *                 type: string
 *                 description: Alias de 'tel' (compatibilité mobile)
 *                 example: "771234567"
 *               motDePasse:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 8
 *                 description: Mot de passe (6-8 caractères, lettres + chiffres)
 *                 example: test123
 *               password:
 *                 type: string
 *                 description: Alias de 'motDePasse' (compatibilité mobile)
 *                 example: test123
 *               typeUtilisateur:
 *                 type: string
 *                 enum: [CLIENT, CHAUFFEUR, ADMIN]
 *                 example: CHAUFFEUR
 *               numPermis:
 *                 type: string
 *                 description: Numéro de permis (requis pour CHAUFFEUR)
 *                 example: PENDING
 *               dateValiditePermis:
 *                 type: string
 *                 format: date
 *                 description: Date de validité du permis (requis pour CHAUFFEUR)
 *                 example: "2026-12-31"
 *               vehicule:
 *                 type: object
 *                 description: Informations du véhicule (requis pour CHAUFFEUR)
 *                 properties:
 *                   marque:
 *                     type: string
 *                     example: Toyota
 *                   modele:
 *                     type: string
 *                     example: Corolla
 *                   immatriculation:
 *                     type: string
 *                     example: DK-1234-AB
 *                   typeVehicule:
 *                     type: string
 *                     example: Berline
 *                   typeClasse:
 *                     type: string
 *                     description: Alias de 'typeVehicule'
 *                     example: Berline
 *                   nombrePlaces:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 9
 *                     example: 4
 *                   nbPlaces:
 *                     type: integer
 *                     description: Alias de 'nombrePlaces'
 *                     example: 4
 *                   assurance:
 *                     type: string
 *                     example: "12345-ASSUR"
 *                   couleur:
 *                     type: string
 *                     example: Blanc
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Inscription réussie
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Requête invalide ou email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     description: Se connecter avec email ou téléphone + mot de passe. Retourne un token JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motDePasse
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur (ou utiliser 'tel')
 *                 example: fatou.sall@example.com
 *               tel:
 *                 type: string
 *                 description: Téléphone de l'utilisateur (ou utiliser 'email')
 *                 example: "771234567"
 *               telephone:
 *                 type: string
 *                 description: Alias de 'tel' (compatibilité mobile)
 *                 example: "771234567"
 *               motDePasse:
 *                 type: string
 *                 description: Mot de passe
 *                 example: test123
 *               password:
 *                 type: string
 *                 description: Alias de 'motDePasse' (compatibilité mobile)
 *                 example: test123
 *           examples:
 *             connexionEmail:
 *               summary: Connexion par email
 *               value:
 *                 email: fatou.sall@example.com
 *                 motDePasse: test123
 *             connexionTel:
 *               summary: Connexion par téléphone
 *               value:
 *                 tel: "771234567"
 *                 motDePasse: test123
 *     responses:
 *       200:
 *         description: Connecté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Connexion réussie
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Compte désactivé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     description: Obtenir les informations complètes de l'utilisateur (profil + véhicule pour chauffeurs)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', protect, getMe);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnecté avec succès
 */
router.post('/logout', protect, logout);

/**
 * @openapi
 * /api/auth/profile:
 *   put:
 *     summary: Mettre à jour le profil (CLIENT/CHAUFFEUR)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prenom:
 *                 type: string
 *               nom:
 *                 type: string
 *               tel:
 *                 type: string
 *               photo:
 *                 type: string
 *               vehicule:
 *                 type: object
 *                 properties:
 *                   typeVehicule:
 *                     type: string
 *                     enum: [BERLINE, SUV, MINIBUS, UTILITAIRE]
 *                   couleur:
 *                     type: string
 *                   nbPlaces:
 *                     type: integer
 *                   immatriculation:
 *                     type: string
 *                   marque:
 *                     type: string
 *                   modele:
 *                     type: string
 *               numPermis:
 *                 type: string
 *               dateValiditePermis:
 *                 type: string
 *                 format: date
 *               dateValiditePermisCir:
 *                 type: string
 *                 format: date
 *               disponibilite:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       401:
 *         description: Non autorisé
 */
router.put('/profile', protect, updateProfile);

/**
 * @openapi
 * /api/auth/password:
 *   put:
 *     summary: Modifier le mot de passe (CLIENT/CHAUFFEUR)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 */
router.put('/password', protect, updatePassword);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Demander la réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Si un compte existe, un token a été généré (retourné ici pour tests)
 */
router.post('/forgot-password', forgotPassword);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe avec un token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé
 *       400:
 *         description: Requête invalide
 */
router.post('/reset-password', resetPassword);

router.put('/admin/users/:id', protect, authorize('ADMIN'), adminUpdateUser);

router.put('/admin/chauffeurs/:id/block', protect, authorize('ADMIN'), adminBlockChauffeur);
router.put('/admin/chauffeurs/:id/unblock', protect, authorize('ADMIN'), adminUnblockChauffeur);

/**
 * @openapi
 * /api/auth/upload/profile:
 *   post:
 *     summary: Upload photo de profil
 *     description: |
 *       Uploader une photo de profil utilisateur (client ou chauffeur).
 *       
 *       **Contraintes:**
 *       - Types acceptés: JPEG, PNG, GIF, WebP
 *       - Taille maximale: 5 MB
 *       - Le fichier doit être envoyé avec la clé "photo"
 *       
 *       **Exemple depuis React Native:**
 *       ```javascript
 *       const formData = new FormData();
 *       formData.append('photo', {
 *         uri: imageUri,
 *         name: 'photo.jpg',
 *         type: 'image/jpeg'
 *       });
 *       
 *       fetch('http://API_URL/api/auth/upload/profile', {
 *         method: 'POST',
 *         headers: {
 *           'Authorization': `Bearer ${token}`
 *         },
 *         body: formData
 *       });
 *       ```
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image (JPEG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Photo uploadée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Photo de profil mise à jour
 *                 photo:
 *                   type: string
 *                   example: /uploads/profiles/12345-1698765432.jpg
 *                   description: URL relative de la photo (à préfixer avec l'URL du serveur)
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur d'upload (fichier manquant, type invalide, ou taille excessive)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/upload/profile', protect, upload.single('photo'), handleUploadError, uploadProfilePhoto);

/**
 * @openapi
 * /api/auth/upload/vehicle:
 *   post:
 *     summary: Upload photo de véhicule (chauffeur uniquement)
 *     description: |
 *       Uploader une photo du véhicule. **Réservé aux chauffeurs uniquement.**
 *       
 *       **Contraintes:**
 *       - Types acceptés: JPEG, PNG, GIF, WebP
 *       - Taille maximale: 5 MB
 *       - Le fichier doit être envoyé avec la clé "photo"
 *       - L'utilisateur doit avoir le rôle CHAUFFEUR
 *       
 *       **Exemple depuis React Native:**
 *       ```javascript
 *       const formData = new FormData();
 *       formData.append('photo', {
 *         uri: vehicleImageUri,
 *         name: 'vehicle.jpg',
 *         type: 'image/jpeg'
 *       });
 *       
 *       fetch('http://API_URL/api/auth/upload/vehicle', {
 *         method: 'POST',
 *         headers: {
 *           'Authorization': `Bearer ${token}`
 *         },
 *         body: formData
 *       });
 *       ```
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image du véhicule (JPEG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Photo de véhicule uploadée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Photo de véhicule mise à jour
 *                 photo:
 *                   type: string
 *                   example: /uploads/vehicles/12345-1698765999.jpg
 *                   description: URL relative de la photo (à préfixer avec l'URL du serveur)
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur d'upload (fichier manquant, type invalide, ou taille excessive)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accès refusé (utilisateur n'est pas un chauffeur)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Seuls les chauffeurs peuvent uploader une photo de véhicule
 */
router.post('/upload/vehicle', protect, upload.single('photo'), handleUploadError, uploadVehiclePhoto);

module.exports = router;
