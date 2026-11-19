const router = require('express').Router();
const ctrl = require('./job.controller');
const auth = require('../../middlewares/fakeAuth.middleware');

// Public routes
router.get('/', ctrl.list);           // GET  /api/jobs
router.get('/:id', ctrl.getOne);      // GET  /api/jobs/5

// Protected routes (require auth)
router.post('/', auth, ctrl.create);         // POST   /api/jobs
router.put('/:id', auth, ctrl.update);       // PUT    /api/jobs/5
router.delete('/:id', auth, ctrl.remove);    // DELETE /api/jobs/5

module.exports = router;
