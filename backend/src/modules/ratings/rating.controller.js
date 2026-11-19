const service = require('./rating.service');

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

exports.create = wrap(async (req, res) => {
  const rating = await service.create(Number(req.params.proposalId), req.user.id, req.body);
  res.status(201).json(rating);
});

exports.freelancerSummary = wrap(async (req, res) => {
  res.json(await service.freelancerSummary(Number(req.params.id)));
});
