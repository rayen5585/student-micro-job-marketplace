const router = require('express').Router();
const c = require('./controller');

router.post('/', c.create);
router.get('/job/:jobId', c.getByJob);
router.get('/:id', c.getOne);
router.put('/:id', c.update);
router.patch('/:id/status', c.updateStatus);
router.delete('/:id', c.remove);

module.exports = router;