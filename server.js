
const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

app.use(express.json({ limit: '1mb' }));

// Servir l'interface web depuis le dossier public.
app.use(express.static(path.join(__dirname, 'public')));

// Vérifier la connexion à PostgreSQL.
app.get('/api/status', async (req, res) => {
  let database = 'error';

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'connected';
  } catch (error) {
    console.error('Échec du contrôle PostgreSQL.');
  }

  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    status: 'success',
    app: 'GrowthOS KashVoix Pro',
    database,
    timestamp: new Date().toISOString()
  });
});

// Diagnostic temporaire en lecture seule.
// Vérifie la présence des trois tables sans modifier la base.
app.get('/api/diagnostic/tables', async (req, res) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('User', 'Category', 'Transaction')
    `;

    const found = new Set(rows.map((row) => row.table_name));

    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      status: 'success',
      database: 'connected',
      tables: {
        User: found.has('User'),
        Category: found.has('Category'),
        Transaction: found.has('Transaction')
      }
    });
  } catch (error) {
    console.error('Échec du diagnostic des tables.');
    res.set('Cache-Control', 'no-store');
    res.status(503).json({
      status: 'error',
      database: 'unavailable',
      message: 'Vérification impossible'
    });
  }
});

// Point d'entrée de l'API.
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    app: 'GrowthOS KashVoix Pro API',
    message: 'API disponible. Consultez /api/status pour son état.'
  });
});

// Synchronisation non encore implémentée.
app.post('/api/v1/sync', (req, res) => {
  res.status(501).json({
    status: 'not_implemented',
    message: 'La synchronisation réelle des données n’est pas encore implémentée.'
  });
});

// Réponse pour les routes inconnues.
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

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} reçu : arrêt du serveur…`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.error('Erreur pendant la fermeture des connexions.');
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
