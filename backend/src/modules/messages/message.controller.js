const service = require('./message.service');

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

exports.list = wrap(async (req, res) => {
  res.json(await service.list(Number(req.params.proposalId), req.user.id));
});

exports.send = wrap(async (req, res) => {
  const message = await service.send(Number(req.params.proposalId), req.user.id, req.body.body);
  res.status(201).json(message);
});