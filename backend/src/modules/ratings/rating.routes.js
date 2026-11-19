const router = require('express').Router();
const ctrl = require('./rating.controller');
const auth = require('../../middlewares/fakeAuth.middleware');

router.post('/proposal/:proposalId', auth, ctrl.create); // lazem client
router.get('/freelancer/:id', ctrl.freelancerSummary);   // public

module.exports = router;