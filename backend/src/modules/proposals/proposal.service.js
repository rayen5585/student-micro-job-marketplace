const { Op } = require('sequelize');
const sequelize = require('../../config/db');
const Proposal = require('./proposal.model');
const Job = require('../jobs/job.model');
const User = require('../users/user.model');

const httpError = (status, message) => Object.assign(new Error(message), { status });

// El changements el mosmou7a men status lel status
const TRANSITIONS = {
  Pending: ['Accepted', 'Rejected'],
  Accepted: ['Completed'],
  Rejected: [],
  Completed: [],
};

// 1) Freelancer ysob proposal
async function create(freelancerId, { jobId, coverLetter, price, deliveryDays }) {
  const job = await Job.findByPk(jobId);
  if (!job) throw httpError(404, 'Job not found');
  if (String(job.postedBy) === String(freelancerId)) {
    throw httpError(400, 'You cannot bid on your own job');
  }
  try {
    return await Proposal.create({ jobId, freelancerId, coverLetter, price, deliveryDays });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw httpError(409, 'You already submitted a proposal for this job');
    }
    throw err;
  }
}

// 2) Saheb el job ychouf el bids mta3 job mte3ou
async function listForJob(jobId, userId) {
  const job = await Job.findByPk(jobId);
  if (!job) throw httpError(404, 'Job not found');
  if (String(job.postedBy) !== String(userId)) {
    throw httpError(403, 'Only the job owner can see the bids');
  }
  return Proposal.findAll({
    where: { jobId },
    include: [{ model: User, as: 'freelancer', attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'DESC']],
  });
}

// 3) Freelancer ychouf proposals mte3ou
function listMine(freelancerId) {
  return Proposal.findAll({
    where: { freelancerId },
    include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'budget'] }],
    order: [['createdAt', 'DESC']],
  });
}

// 4) Proposal wa7da
async function getById(id) {
  const proposal = await Proposal.findByPk(id, {
    include: [
      { model: Job, as: 'job' },
      { model: User, as: 'freelancer', attributes: ['id', 'name', 'email'] },
    ],
  });
  if (!proposal) throw httpError(404, 'Proposal not found');
  return proposal;
}

// 5) Freelancer ybaddel proposal mte3ou (ken Pending)
async function update(id, freelancerId, data) {
  const proposal = await Proposal.findByPk(id);
  if (!proposal) throw httpError(404, 'Proposal not found');
  if (String(proposal.freelancerId) !== String(freelancerId)) throw httpError(403, 'Not your proposal');
  if (proposal.status !== 'Pending') throw httpError(400, 'Only pending proposals can be edited');

  const { coverLetter, price, deliveryDays } = data;
  if (coverLetter !== undefined) proposal.coverLetter = coverLetter;
  if (price !== undefined) proposal.price = price;
  if (deliveryDays !== undefined) proposal.deliveryDays = deliveryDays;
  return proposal.save();
}

// 6) Freelancer yfassakh proposal mte3ou (ken Pending)
async function remove(id, freelancerId) {
  const proposal = await Proposal.findByPk(id);
  if (!proposal) throw httpError(404, 'Proposal not found');
  if (String(proposal.freelancerId) !== String(freelancerId)) throw httpError(403, 'Not your proposal');
  if (proposal.status !== 'Pending') throw httpError(400, 'Only pending proposals can be withdrawn');
  await proposal.destroy();
}

// 7) Status transition logic (el client ykhtar)
function changeStatus(id, userId, newStatus) {
  return sequelize.transaction(async (t) => {
    const proposal = await Proposal.findByPk(id, {
      include: [{ model: Job, as: 'job' }],
      transaction: t,
    });
    if (!proposal) throw httpError(404, 'Proposal not found');
    if (String(proposal.job.postedBy) !== String(userId)) {
      throw httpError(403, 'Only the job owner can change the status');
    }

    const allowed = TRANSITIONS[proposal.status] || [];
    if (!allowed.includes(newStatus)) {
      throw httpError(400, `Invalid transition: ${proposal.status} -> ${newStatus}`);
    }

    if (newStatus === 'Accepted') {
      const already = await Proposal.count({
        where: { jobId: proposal.jobId, status: { [Op.in]: ['Accepted', 'Completed'] } },
        transaction: t,
      });
      if (already) throw httpError(409, 'Another proposal was already accepted for this job');

      // el baqi el Pending yet-rejectaw automatiquement
      await Proposal.update(
        { status: 'Rejected' },
        {
          where: { jobId: proposal.jobId, id: { [Op.ne]: proposal.id }, status: 'Pending' },
          transaction: t,
        }
      );
    }

    proposal.status = newStatus;
    await proposal.save({ transaction: t });
    return proposal;
  });
}

module.exports = { create, listForJob, listMine, getById, update, remove, changeStatus };