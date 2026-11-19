const router = require('express').Router();
const ctrl = require('./notification.controller');
const auth = require('../../middlewares/fakeAuth.middleware');

router.use(auth);

router.get('/', ctrl.list);                  // GET   /api/notifications
router.patch('/read-all', ctrl.markAllRead); // PATCH /api/notifications/read-all
router.patch('/:id/read', ctrl.markRead);    // PATCH /api/notifications/5/read

module.exports = router;