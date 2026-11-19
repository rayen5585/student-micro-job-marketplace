const router = require('express').Router();
const ctrl = require('./message.controller');
const auth = require('../../middlewares/fakeAuth.middleware');

router.use(auth);

router.get('/proposal/:proposalId', ctrl.list);   // GET  /api/messages/proposal/5
router.post('/proposal/:proposalId', ctrl.send);  // POST /api/messages/proposal/5

module.exports = router;