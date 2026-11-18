const Proposal = require('./model');

// transitions permises
const transitions = {
  Pending:   ['Accepted', 'Rejected'],
  Accepted:  ['Completed'],
  Rejected:  [],
  Completed: []
};

exports.create = async (req, res) => {
  try {
    const { jobId, freelancerId, message, bidAmount } = req.body;
    const proposal = await Proposal.create({ jobId, freelancerId, message, bidAmount });
    res.status(201).json(proposal);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getByJob = async (req, res) => {
  try {
    const proposals = await Proposal.findAll({ where: { jobId: req.params.jobId } });
    res.json(proposals);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const p = await Proposal.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Proposal not found' });
    res.json(p);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const p = await Proposal.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Proposal not found' });
    if (p.status !== 'Pending')
      return res.status(400).json({ error: 'Only pending proposals can be edited' });
    const { message, bidAmount } = req.body;
    await p.update({ message, bidAmount });
    res.json(p);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const p = await Proposal.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Proposal not found' });
    const { status } = req.body;
    if (!transitions[p.status].includes(status))
      return res.status(400).json({ error: `Cannot go from ${p.status} to ${status}` });
    await p.update({ status });
    res.json(p);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const p = await Proposal.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Proposal not found' });
    await p.destroy();
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};