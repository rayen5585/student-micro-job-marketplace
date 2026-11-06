const service = require('./search.service');

// ya5ou ay erreur w yb3athha lel error middleware
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

exports.searchJobs = wrap(async (req, res) => {
  res.json(await service.searchJobs(req.query));
});

exports.sortedBids = wrap(async (req, res) => {
  res.json(await service.sortedBids(req.params.jobId, req.user.id, req.query.sort));
});