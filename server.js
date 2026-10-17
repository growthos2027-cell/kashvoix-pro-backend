const express = require('express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Route de test principale
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    app: 'GrowthOS KashVoix Pro API',
    message: 'Serveur opérationnel et connecté au cloud !'
  });
});

// Route de synchronisation Offline-First
app.post('/api/v1/sync', async (req, res) => {
  try {
    res.json({ status: 'synchronized', timestamp: Date.now() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur KashVoix Pro en écoute sur le port ${PORT}`);
});

