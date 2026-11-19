
const express = require('express');
const app = express();
const db = require('./config/db');
const usersRoutes = require('./modules/users/users.routes');

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // Le navigateur envoie d'abord une requête OPTIONS (preflight) avant un PUT : on répond OK
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Route principale
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur le Student 1 Backend !' });
});

// Routes du module users (Student 1)
app.use('/api', usersRoutes);

// Démarrage du serveur
const PORT = 3000;

// D'abord on prépare MySQL (base + table), ensuite on démarre le serveur
db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Serveur lancé sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Impossible de se connecter à MySQL : démarre MySQL dans XAMPP.');
    console.error('Code :', err.code, '|', err.message || (err.errors && err.errors[0] && err.errors[0].message));
    process.exit(1);   // on arrête : sans base, le backend ne sert à rien
  });