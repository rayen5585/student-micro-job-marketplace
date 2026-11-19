const service = require('./admin.service');

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

exports.me = wrap(async (req, res) => {
  const { id, name, email, role } = req.admin;
  res.json({ id, name, email, role });
});
exports.stats = wrap(async (req, res) => res.json(await service.stats()));

exports.listUsers = wrap(async (req, res) => res.json(await service.listUsers()));
exports.setRole = wrap(async (req, res) =>
  res.json(await service.setRole(req.params.id, req.body.role, req.admin.id))
);
exports.removeUser = wrap(async (req, res) => {
  await service.removeUser(req.params.id, req.admin.id);
  res.status(204).end();
});

exports.listJobs = wrap(async (req, res) => res.json(await service.listJobs()));
exports.removeJob = wrap(async (req, res) => {
  await service.removeJob(req.params.id);
  res.status(204).end();
});

exports.listProposals = wrap(async (req, res) => res.json(await service.listProposals(req.query.status)));
exports.removeProposal = wrap(async (req, res) => {
  await service.removeProposal(req.params.id);
  res.status(204).end();
});