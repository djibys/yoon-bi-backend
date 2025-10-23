const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, updateProfile, updatePassword, forgotPassword, resetPassword, adminUpdateUser, adminBlockChauffeur, adminUnblockChauffeur } = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth');

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
 *     summary: Inscription utilisateur
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
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               tel:
 *                 type: string
 *               motDePasse:
 *                 type: string
 *                 minLength: 6
 *               typeUtilisateur:
 *                 type: string
 *                 enum: [ADMIN, CLIENT, CHAUFFEUR]
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Requête invalide
 */
router.post('/register', register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [email, motDePasse]
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                   motDePasse:
 *                     type: string
 *               - type: object
 *                 required: [tel, motDePasse]
 *                 properties:
 *                   tel:
 *                     type: string
 *                   motDePasse:
 *                     type: string
 *     responses:
 *       200:
 *         description: Connecté avec succès
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *       401:
 *         description: Non autorisé
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

module.exports = router;
