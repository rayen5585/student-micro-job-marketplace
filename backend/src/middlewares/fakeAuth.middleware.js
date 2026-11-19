// Unified auth middleware: tries JWT first (Khoubaib), falls back to x-user-id dev header (Rayen).
// This allows both auth systems to coexist during the integration phase.
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

module.exports = (req, res, next) => {
  // 1. Try JWT Bearer token (Khoubaib's real auth)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
      req.user = { id: payload.id, email: payload.email };
      return next();
    } catch (err) {
      // Invalid/expired token — fall through to x-user-id or reject
    }
  }

  // 2. Fall back to dev x-user-id header (Rayen's development workflow)
  const userId = req.header('x-user-id');
  if (userId && !isNaN(Number(userId))) {
    req.user = { id: Number(userId) };
    return next();
  }

  // 3. No valid auth found
  return res.status(401).json({ message: 'Authentication required' });
};
