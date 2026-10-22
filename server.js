
const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

app.use(express.json({ limit: '1mb' }));

// Servir l'interface web depuis public/index.html.
app.use(express.static(path.join(__dirname, 'public')));

// Vérifier l'état du serveur et la connexion PostgreSQL.
app.get('/api/status', async (req, res) => {
  let database = 'error';

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'connected';
  } catch (error) {
    console.error('Échec du contrôle PostgreSQL:', error.message);
  }

  res.status(200).json({
    status: 'success',
    app: 'GrowthOS KashVoix Pro',
    database,
    timestamp: new Date().toISOString()
  });
});

// Point d'entrée de l'API.
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    app: 'GrowthOS KashVoix Pro API',
    message: 'API disponible. Consultez /api/status pour son état.'
  });
});

// La synchronisation réelle n'est pas encore implémentée.
app.post('/api/v1/sync', (req, res) => {
  res.status(501).json({
    status: 'not_implemented',
    message: 'La synchronisation réelle des données n’est pas encore implémentée.'
  });
});

// Réponse JSON pour les routes inconnues.
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route introuvable.'
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur KashVoix Pro en écoute sur le port ${PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} reçu : arrêt du serveur…`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
