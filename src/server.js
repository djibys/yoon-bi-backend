require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Yoon-Bi API',
      version: '1.0.0',
      description: 'Documentation de l\'API Yoon-Bi',
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 3000}` },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './src/routes/*.js',
    './src/routes/**/*.js',
  ],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

// 404 handler JSON
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
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
