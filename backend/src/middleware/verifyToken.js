const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

// Middleware : une fonction qui s'exécute ENTRE la requête reçue et la réponse finale
// (req = requête, res = réponse, next = "passe à l'étape suivante")
function verifyToken(req, res, next) {
  // 1. On lit l'en-tête envoyé par l'interceptor : "Bearer eyJ..."
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  // 2. On garde seulement le jeton (la partie après "Bearer ")
  const token = header.split(' ')[1];

  try {
    // 3. jwt.verify recalcule la signature avec la clé secrète : si elle est fausse ou si le jeton a expiré, ça lance une erreur
    req.user = jwt.verify(token, JWT_SECRET);   // req.user = { id, email, iat, exp }
    next();                                     // jeton valide : on continue vers la route
  } catch (e) {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

module.exports = verifyToken;
