const service = require('./proposal.service');
const { STATUSES } = require('./proposal.model');

const bad = (message) => Object.assign(new Error(message), { status: 400 });

// Validation mta3 el input 9bal ma nwaddou lel service
function validateBody(body, partial = false) {
  const { coverLetter, price, deliveryDays } = body;
  const missing = (v) => !partial && (v === undefined || v === null || v === '');

  if (missing(coverLetter) || (coverLetter !== undefined && String(coverLetter).trim().length < 20)) {
    throw bad('coverLetter must be at least 20 characters');
  }
  if (missing(price) || (price !== undefined && !(Number(price) > 0))) {
    throw bad('price must be a number greater than 0');
  }
  if (
    missing(deliveryDays) ||
    (deliveryDays !== undefined && !(Number.isInteger(Number(deliveryDays)) && Number(deliveryDays) > 0))
  ) {
    throw bad('deliveryDays must be a positive integer');
  }
}

// ya5ou ay error w yb3athha lel error middleware
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

exports.create = wrap(async (req, res) => {
  if (!req.body.jobId) throw bad('jobId is required');
  validateBody(req.body);
  const proposal = await service.create(req.user.id, req.body);
  res.status(201).json(proposal);
});

exports.listForJob = wrap(async (req, res) => {
  res.json(await service.listForJob(req.params.jobId, req.user.id));
});

exports.listMine = wrap(async (req, res) => {
  res.json(await service.listMine(req.user.id));
});

exports.getOne = wrap(async (req, res) => {
  res.json(await service.getById(req.params.id));
});

exports.update = wrap(async (req, res) => {
  validateBody(req.body, true);
  res.json(await service.update(req.params.id, req.user.id, req.body));
});

exports.remove = wrap(async (req, res) => {
  await service.remove(req.params.id, req.user.id);
  res.status(204).end();
});

exports.changeStatus = wrap(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    throw bad(`status must be one of: ${STATUSES.join(', ')}`);
  }
  res.json(await service.changeStatus(req.params.id, req.user.id, status));
});