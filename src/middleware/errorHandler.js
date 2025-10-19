exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('🔴 Erreur:', err);

  if (err.name === 'CastError') {
    error.message = 'Ressource non trouvée';
    error.statusCode = 404;
  }

  if (err.code === 11000) {
    error.message = 'Cette valeur existe déjà';
    error.statusCode = 400;
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = messages.join(', ');
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};