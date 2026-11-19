const service = require('./notification.service');

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

exports.list = wrap(async (req, res) => {
  const [items, unread] = await Promise.all([
    service.list(req.user.id),
    service.unreadCount(req.user.id),
  ]);
  res.json({ items, unread });
});

exports.markRead = wrap(async (req, res) => {
  res.json(await service.markRead(Number(req.params.id), req.user.id));
});

exports.markAllRead = wrap(async (req, res) => {
  await service.markAllRead(req.user.id);
  res.status(204).end();
});