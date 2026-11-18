const store = require('../models/jobStore');

exports.getJobs = (req, res) => {
  res.json(store.getAll());
};

exports.getJob = (req, res) => {
  const job = store.getById(Number(req.params.id));
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json(job);
};

exports.createJob = (req, res) => {
  const { title, description, budget, category, deadline } = req.body;
  const job = store.create({
    title: title.trim(),
    description: description.trim(),
    budget,
    category,
    deadline,
  });
  res.status(201).json(job);
};

exports.updateJob = (req, res) => {
  const { title, description, budget, category, deadline } = req.body;
  const job = store.update(Number(req.params.id), {
    title: title.trim(),
    description: description.trim(),
    budget,
    category,
    deadline,
  });
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json(job);
};

exports.deleteJob = (req, res) => {
  const deleted = store.remove(Number(req.params.id));
  if (!deleted) return res.status(404).json({ message: 'Job not found' });
  res.status(204).send();
};