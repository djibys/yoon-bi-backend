const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res, next) => {
  try {
    const { prenom, nom, email, tel, motDePasse, typeUtilisateur, ...rest } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email est déjà utilisé' 
      });
    }

    const user = await User.create({
      prenom,
      nom,
      email,
      tel,
      motDePasse,
      typeUtilisateur,
      ...rest
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      token,
      user: {
        id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        typeUtilisateur: user.typeUtilisateur
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, tel, motDePasse } = req.body || {};

    if ((!email && !tel) || !motDePasse) {
      return res.status(400).json({ 
        success: false,
        message: 'Identifiant requis (email ou téléphone) et mot de passe requis' 
      });
    }

    const query = email ? { email } : { tel };
    const user = await User.findOne(query).select('+motDePasse');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Identifiants invalides' 
      });
    }

    const isMatch = await user.comparePassword(motDePasse);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Identifiants invalides' 
      });
    }

    if (!user.actif) {
      return res.status(403).json({ 
        success: false,
        message: 'Votre compte a été désactivé' 
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        typeUtilisateur: user.typeUtilisateur,
        photo: user.photo,
        ...(user.typeUtilisateur === 'CHAUFFEUR' && {
          noteEval: user.noteEval,
          nbCourses: user.nbCourses,
          statutValidation: user.statutValidation
        })
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // Avec JWT stateless, la déconnexion est côté client
    // Ici on répond simplement 200 pour indiquer au client de supprimer le token
    return res.json({
      success: true,
      message: 'Déconnexion réussie. Supprimez le token côté client.'
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const allowedCommon = ['prenom', 'nom', 'tel', 'photo'];
    const allowedChauffeur = ['vehicule', 'numPermis', 'dateValiditePermis', 'dateValiditePermisCir', 'disponibilite'];

    const updates = {};
    for (const key of allowedCommon) {
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    if (user.typeUtilisateur === 'CHAUFFEUR') {
      for (const key of allowedChauffeur) {
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
          if (key === 'vehicule' && typeof req.body.vehicule === 'object' && req.body.vehicule !== null) {
            const vehiculeAllowed = ['typeVehicule', 'couleur', 'nbPlaces', 'immatriculation', 'marque', 'modele'];
            updates.vehicule = updates.vehicule || {};
            for (const vKey of vehiculeAllowed) {
              if (Object.prototype.hasOwnProperty.call(req.body.vehicule, vKey)) {
                updates.vehicule[vKey] = req.body.vehicule[vKey];
              }
            }
          } else {
            updates[key] = req.body[key];
          }
        }
      }
    }

    // Ne pas autoriser la modification de l'email, du typeUtilisateur ou des champs sensibles ici
    const updated = await User.findByIdAndUpdate(user._id, updates, {
      new: true,
      runValidators: true
    });

    return res.json({ success: true, message: 'Profil mis à jour', user: updated });
  } catch (error) {
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Champs requis: currentPassword, newPassword' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    const user = await User.findById(req.user.id).select('+motDePasse');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect' });
    }

    user.motDePasse = newPassword;
    await user.save();

    return res.json({ success: true, message: 'Mot de passe mis à jour' });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }

    const user = await User.findOne({ email });
    // Réponse générique pour ne pas révéler l'existence du compte
    if (!user) {
      return res.json({ success: true, message: 'Si un compte existe, un lien de réinitialisation a été généré' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashed;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save({ validateBeforeSave: false });

    // En production, envoyer le token par email. Pour tests Swagger, on le retourne.
    return res.json({ success: true, message: 'Token de réinitialisation généré', token: resetToken, expireAt: user.resetPasswordExpire });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Champs requis: token, newPassword' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: new Date() }
    }).select('+motDePasse');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token invalide ou expiré' });
    }

    user.motDePasse = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.json({ success: true, message: 'Mot de passe réinitialisé' });
  } catch (error) {
    next(error);
  }
};

exports.adminUpdateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('+motDePasse');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const allowedCommon = ['prenom', 'nom', 'email', 'tel', 'photo', 'typeUtilisateur', 'actif'];
    const allowedChauffeur = ['vehicule', 'numPermis', 'dateValiditePermis', 'dateValiditePermisCir', 'disponibilite', 'statutValidation'];

    for (const key of allowedCommon) {
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
        user[key] = req.body[key];
      }
    }

    // Champs spécifiques chauffeur
    const targetType = req.body && req.body.typeUtilisateur ? req.body.typeUtilisateur : user.typeUtilisateur;
    if (targetType === 'CHAUFFEUR') {
      for (const key of allowedChauffeur) {
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
          if (key === 'vehicule' && typeof req.body.vehicule === 'object' && req.body.vehicule !== null) {
            const vehiculeAllowed = ['typeVehicule', 'couleur', 'nbPlaces', 'immatriculation', 'marque', 'modele'];
            user.vehicule = user.vehicule || {};
            for (const vKey of vehiculeAllowed) {
              if (Object.prototype.hasOwnProperty.call(req.body.vehicule, vKey)) {
                user.vehicule[vKey] = req.body.vehicule[vKey];
              }
            }
          } else {
            user[key] = req.body[key];
          }
        }
      }
    } else {
      // Si l'utilisateur n'est pas chauffeur, nettoyer les champs chauffeur si explicitement fournis
      if (req.body && (req.body.numPermis !== undefined || req.body.dateValiditePermis !== undefined || req.body.dateValiditePermisCir !== undefined || req.body.disponibilite !== undefined || req.body.vehicule !== undefined)) {
        user.numPermis = req.body.numPermis ?? user.numPermis;
        user.dateValiditePermis = req.body.dateValiditePermis ?? user.dateValiditePermis;
        user.dateValiditePermisCir = req.body.dateValiditePermisCir ?? user.dateValiditePermisCir;
        user.disponibilite = req.body.disponibilite ?? user.disponibilite;
        if (req.body.vehicule) {
          user.vehicule = user.vehicule || {};
          const vehiculeAllowed = ['typeVehicule', 'couleur', 'nbPlaces', 'immatriculation', 'marque', 'modele'];
          for (const vKey of vehiculeAllowed) {
            if (Object.prototype.hasOwnProperty.call(req.body.vehicule, vKey)) {
              user.vehicule[vKey] = req.body.vehicule[vKey];
            }
          }
        }
      }
    }

    // Optionnel: mise à jour du mot de passe par l'admin
    if (req.body && req.body.motDePasse) {
      if (String(req.body.motDePasse).length < 6) {
        return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      user.motDePasse = req.body.motDePasse;
    }

    await user.save();

    const sanitized = user.toJSON();
    return res.json({ success: true, message: 'Utilisateur mis à jour', user: sanitized });
  } catch (error) {
    next(error);
  }
};

exports.adminBlockChauffeur = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    if (user.typeUtilisateur !== 'CHAUFFEUR') {
      return res.status(400).json({ success: false, message: 'Cible non chauffeur' });
    }
    user.actif = false;
    user.disponibilite = false;
    await user.save();
    return res.json({ success: true, message: 'Chauffeur bloqué', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

exports.adminUnblockChauffeur = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    if (user.typeUtilisateur !== 'CHAUFFEUR') {
      return res.status(400).json({ success: false, message: 'Cible non chauffeur' });
    }
    user.actif = true;
    await user.save();
    return res.json({ success: true, message: 'Chauffeur débloqué', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};