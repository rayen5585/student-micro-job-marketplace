const router = require('express').Router();
const ctrl = require('./proposal.controller');
const auth = require('../../middlewares/fakeAuth.middleware');

router.use(auth); // kol les routes lazemhom user

router.post('/', ctrl.create);                    // POST   /api/proposals
router.get('/me', ctrl.listMine);                 // GET    /api/proposals/me
router.get('/job/:jobId', ctrl.listForJob);       // GET    /api/proposals/job/1
router.get('/:id', ctrl.getOne);                  // GET    /api/proposals/5
router.put('/:id', ctrl.update);                  // PUT    /api/proposals/5
router.delete('/:id', ctrl.remove);               // DELETE /api/proposals/5
router.patch('/:id/status', ctrl.changeStatus);   // PATCH  /api/proposals/5/status

module.exports = router;