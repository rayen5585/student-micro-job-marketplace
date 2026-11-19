const User = require('../modules/users/user.model');

// lazem yetsta3mel ba3d auth (houwa li ya3mel req.user)
module.exports = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    req.admin = user;
    next();
  } catch (err) {
    next(err);
  }
};