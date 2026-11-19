const router = require('express').Router();
const ctrl = require('./admin.controller');
const auth = require('../../middlewares/fakeAuth.middleware');
const admin = require('../../middlewares/admin.middleware');

router.use(auth, admin); // kol les routes: lazem user + lazem admin

router.get('/me', ctrl.me);
router.get('/stats', ctrl.stats);

router.get('/users', ctrl.listUsers);
router.patch('/users/:id/role', ctrl.setRole);
router.delete('/users/:id', ctrl.removeUser);

router.get('/jobs', ctrl.listJobs);
router.delete('/jobs/:id', ctrl.removeJob);

router.get('/proposals', ctrl.listProposals);
router.delete('/proposals/:id', ctrl.removeProposal);

module.exports = router;