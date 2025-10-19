require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/trajets', require('./routes/trajet.routes'));
app.use('/api/reservations', require('./routes/reservation.routes'));
app.use('/api/paiements', require('./routes/paiement.routes'));
app.use('/api/evaluations', require('./routes/evaluation.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.get('/', (req, res) => {
  res.json({ 
    message: '🚗 Bienvenue sur l\'API Yoon-Bi', 
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      trajets: '/api/trajets',
      reservations: '/api/reservations',
      paiements: '/api/paiements',
      evaluations: '/api/evaluations',
      admin: '/api/admin'
    }
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║         🚀 SERVEUR YOON-BI DÉMARRÉ AVEC SUCCÈS           ║
╠═══════════════════════════════════════════════════════════╣
║  Port:        ${PORT}                                       ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║  URL:         http://localhost:${PORT}                    ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
