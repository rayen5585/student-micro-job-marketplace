const Notification = require('./notification.model');

const httpError = (status, message) => Object.assign(new Error(message), { status });

// options.transaction ikhtiyari: ki nكounou fi transaction (ex changeStatus)
const notify = (userId, message, link = null, options = {}) =>
  Notification.create({ userId, message: String(message).slice(0, 255), link }, options);

const list = (userId) =>
  Notification.findAll({ where: { userId }, order: [['createdAt', 'DESC']], limit: 20 });

const unreadCount = (userId) => Notification.count({ where: { userId, isRead: false } });

async function markRead(id, userId) {
  const n = await Notification.findByPk(id);
  if (!n) throw httpError(404, 'Notification not found');
  if (Number(n.userId) !== Number(userId)) throw httpError(403, 'Not your notification');
  n.isRead = true;
  await n.save();
  return n;
}

const markAllRead = (userId) =>
  Notification.update({ isRead: true }, { where: { userId, isRead: false } });

module.exports = { notify, list, unreadCount, markRead, markAllRead };