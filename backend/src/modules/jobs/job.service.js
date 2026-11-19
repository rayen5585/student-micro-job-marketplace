const Job = require('./job.model');
const Proposal = require('../proposals/proposal.model');

const httpError = (status, message) => Object.assign(new Error(message), { status });

// List all jobs (newest first)
function list() {
  return Job.findAll({ order: [['createdAt', 'DESC']] });
}

// Get a single job by id
async function getById(id) {
  const job = await Job.findByPk(id);
  if (!job) throw httpError(404, 'Job not found');
  return job;
}

// Create a new job
async function create(postedBy, { title, description, budget, skills, deadline }) {
  return Job.create({
    title: String(title).trim(),
    description: String(description).trim(),
    budget: Number(budget),
    postedBy,
    skills: Array.isArray(skills) ? skills : [],
    deadline: deadline || null,
  });
}

// Update a job (only by owner, only if no accepted proposals)
async function update(id, userId, { title, description, budget, skills, deadline }) {
  const job = await Job.findByPk(id);
  if (!job) throw httpError(404, 'Job not found');
  if (Number(job.postedBy) !== Number(userId)) throw httpError(403, 'Only the job owner can edit this job');

  // Prevent editing if a proposal has been accepted
  const accepted = await Proposal.count({ where: { jobId: id, status: 'Accepted' } });
  if (accepted) throw httpError(400, 'Cannot edit a job with an accepted proposal');

  if (title !== undefined) job.title = String(title).trim();
  if (description !== undefined) job.description = String(description).trim();
  if (budget !== undefined) job.budget = Number(budget);
  if (skills !== undefined) job.skills = Array.isArray(skills) ? skills : [];
  if (deadline !== undefined) job.deadline = deadline || null;

  return job.save();
}

// Delete a job (only by owner) — also deletes related proposals
async function remove(id, userId) {
  const job = await Job.findByPk(id);
  if (!job) throw httpError(404, 'Job not found');
  if (Number(job.postedBy) !== Number(userId)) throw httpError(403, 'Only the job owner can delete this job');

  await Proposal.destroy({ where: { jobId: id } });
  await job.destroy();
}

module.exports = { list, getById, create, update, remove };
