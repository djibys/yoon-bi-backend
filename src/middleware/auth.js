const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Non autorisé - Token manquant' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-motDePasse');
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Non autorisé - Token invalide' 
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.typeUtilisateur)) {
      return res.status(403).json({ 
        success: false,
        message: `Le rôle ${req.user.typeUtilisateur} n'est pas autorisé` 
      });
    }
    next();
  };
};
