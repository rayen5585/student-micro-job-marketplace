// Clé secrète partagée : elle signe les jetons (users.routes.js) et les vérifie (verifyToken.js)
// En vrai projet : on la met dans une variable d'environnement, jamais dans le code
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'change-moi-en-production'
};
