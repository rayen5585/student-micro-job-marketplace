const express = require('express');
const router = express.Router();
const controller = require('./job.controller');
const validateJob = require('../../middlewares/validateJob');

router.get('/', controller.getJobs);
router.get('/:id', controller.getJob);
router.post('/', validateJob, controller.createJob);
router.put('/:id', validateJob, controller.updateJob);
router.delete('/:id', controller.deleteJob);

module.exports = router;