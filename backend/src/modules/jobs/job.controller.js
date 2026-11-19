const service = require('./job.service');

const bad = (message) => Object.assign(new Error(message), { status: 400 });
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

function validateBody(body, partial = false) {
  const { title, description, budget } = body;
  const missing = (v) => !partial && (v === undefined || v === null || v === '');

  if (missing(title) || (title !== undefined && String(title).trim().length < 3)) {
    throw bad('title must be at least 3 characters');
  }
  if (missing(description) || (description !== undefined && String(description).trim().length < 10)) {
    throw bad('description must be at least 10 characters');
  }
  if (missing(budget) || (budget !== undefined && !(Number(budget) > 0))) {
    throw bad('budget must be a number greater than 0');
  }
}

exports.list = wrap(async (req, res) => {
  res.json(await service.list());
});

exports.getOne = wrap(async (req, res) => {
  res.json(await service.getById(req.params.id));
});

exports.create = wrap(async (req, res) => {
  validateBody(req.body);
  const job = await service.create(req.user.id, req.body);
  res.status(201).json(job);
});

exports.update = wrap(async (req, res) => {
  validateBody(req.body, true);
  res.json(await service.update(req.params.id, req.user.id, req.body));
});

exports.remove = wrap(async (req, res) => {
  await service.remove(req.params.id, req.user.id);
  res.status(204).end();
});
