const router = require('express').Router();
const ctrl = require('./search.controller');
const auth = require('../../middlewares/fakeAuth.middleware');

router.get('/jobs', ctrl.searchJobs);                 // public
router.get('/jobs/:jobId/bids', auth, ctrl.sortedBids); // lazem user (client)

module.exports = router;