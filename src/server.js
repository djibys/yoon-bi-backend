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

// Servir les fichiers statiques (photos uploadées)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Yoon-Bi API',
      version: '2.0.0',
      description: 'API REST pour l\'application de covoiturage Yoon-Bi - Gestion des utilisateurs, trajets, réservations et uploads de photos',
      contact: {
        name: 'Yoon-Bi Support',
        email: 'support@yoonbi.sn'
      }
    },
    servers: [
      { 
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Serveur de développement local'
      },
      {
        url: `http://192.168.1.23:${process.env.PORT || 3000}`,
        description: 'Serveur accessible depuis mobile'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Authentification et gestion des utilisateurs' },
      { name: 'Trajets', description: 'Gestion des trajets' },
      { name: 'Réservations', description: 'Gestion des réservations' },
      { name: 'Paiements', description: 'Gestion des paiements' },
      { name: 'Évaluations', description: 'Notes et avis' },
      { name: 'Signalements', description: 'Signalements de problèmes' },
      { name: 'Admin', description: 'Administration' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu après connexion'
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            prenom: { type: 'string', example: 'Fatou' },
            nom: { type: 'string', example: 'Sall' },
            email: { type: 'string', format: 'email', example: 'fatou.sall@example.com' },
            tel: { type: 'string', example: '771234567' },
            photo: { type: 'string', example: '/uploads/profiles/12345-67890.jpg' },
            typeUtilisateur: { 
              type: 'string', 
              enum: ['CLIENT', 'CHAUFFEUR', 'ADMIN'],
              example: 'CHAUFFEUR'
            },
            noteEval: { type: 'number', minimum: 0, maximum: 5, example: 4.5 },
            disponibilite: { type: 'boolean', example: true },
            vehicule: { $ref: '#/components/schemas/Vehicule' }
          }
        },
        Vehicule: {
          type: 'object',
          properties: {
            marque: { type: 'string', example: 'Toyota' },
            modele: { type: 'string', example: 'Corolla' },
            immatriculation: { type: 'string', example: 'DK-1234-AB' },
            typeVehicule: { type: 'string', example: 'Berline' },
            typeClasse: { type: 'string', example: 'Berline' },
            nombrePlaces: { type: 'integer', minimum: 1, maximum: 9, example: 4 },
            nbPlaces: { type: 'integer', minimum: 1, maximum: 9, example: 4 },
            assurance: { type: 'string', example: '12345-ASSUR' },
            couleur: { type: 'string', example: 'Blanc' },
            photo: { type: 'string', example: '/uploads/vehicles/12345-67890.jpg' }
          }
        },
        Trajet: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            chauffeur: { $ref: '#/components/schemas/User' },
            depart: { type: 'string', example: 'Dakar' },
            arrivee: { type: 'string', example: 'Thiès' },
            dateDebut: { type: 'string', format: 'date-time', example: '2025-10-30T10:00:00Z' },
            prixParPlace: { type: 'number', example: 2500 },
            nbPlacesDisponibles: { type: 'integer', example: 3 },
            statut: { 
              type: 'string',
              enum: ['EN_ATTENTE', 'VALIDE', 'ANNULE', 'TERMINE'],
              example: 'VALIDE'
            }
          }
        },
        Reservation: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            trajet: { $ref: '#/components/schemas/Trajet' },
            client: { $ref: '#/components/schemas/User' },
            nbPlaces: { type: 'integer', example: 2 },
            prixTotal: { type: 'number', example: 5000 },
            statut: {
              type: 'string',
              enum: ['EN_ATTENTE', 'CONFIRMEE', 'ANNULEE'],
              example: 'CONFIRMEE'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Message d\'erreur' }
          }
        }
      }
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
app.use('/api/signalements', require('./routes/signalement.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/admin/finance', require('./routes/finance.routes'));
app.use('/api/admin/reports', require('./routes/report.routes'));

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
const HOST = '0.0.0.0'; // Écouter sur toutes les interfaces pour accès mobile

app.listen(PORT, HOST, () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Trouver l'adresse IP locale
  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
      }
    });
  });
  
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║         🚀 SERVEUR YOON-BI DÉMARRÉ AVEC SUCCÈS           ║
╠═══════════════════════════════════════════════════════════╣
║  Port:        ${PORT}                                       ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║  URL Local:   http://localhost:${PORT}                    ║
║  URL Mobile:  http://${localIP}:${PORT}                   ║
║  API Docs:    http://${localIP}:${PORT}/api-docs         ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
