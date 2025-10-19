const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ 
        success: false,
        message: 'Email et mot de passe requis' 
      });
    }

    const user = await User.findOne({ email }).select('+motDePasse');
    
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