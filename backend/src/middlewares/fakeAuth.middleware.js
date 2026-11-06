// MO2AQQAT: yetbaddel bel JWT middleware mta3 Student 1 ki ykamel.
module.exports = (req, res, next) => {
  const id = req.header('x-user-id');
  if (!id) return res.status(401).json({ message: 'Missing x-user-id header' });
  req.user = { id: Number(id) };
  next();
};