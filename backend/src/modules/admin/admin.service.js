const { fn, col } = require('sequelize');
const sequelize = require('../../config/db');
const User = require('../users/user.model');
const Job = require('../jobs/job.model');
const Proposal = require('../proposals/proposal.model');
const Message = require('../messages/message.model');
const Rating = require('../ratings/rating.model');
const Notification = require('../notifications/notification.model');

const httpError = (status, message) => Object.assign(new Error(message), { status });

// ---------- Dashboard stats ----------
async function stats() {
  const [users, admins, jobs, proposals] = await Promise.all([
    User.count(),
    User.count({ where: { role: 'admin' } }),
    Job.count(),
    Proposal.count(),
  ]);

  // répartition des proposals par status
  const rows = await Proposal.findAll({
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
    raw: true,
  });
  const byStatus = { Pending: 0, Accepted: 0, Rejected: 0, Completed: 0 };
  rows.forEach((r) => (byStatus[r.status] = Number(r.count)));

  const totalBudget = Number((await Job.sum('budget')) || 0);
  const completedValue = Number((await Proposal.sum('price', { where: { status: 'Completed' } })) || 0);

  // ===== stats par mois (12 a5er chhour) =====
  const [allProposals, allJobs] = await Promise.all([
    Proposal.findAll({ attributes: ['createdAt'], raw: true }),
    Job.findAll({ attributes: ['createdAt'], raw: true }),
  ]);
  const now = new Date();
  const byMonth = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    byMonth.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString('en', { month: 'short' }),
      proposals: 0,
      jobs: 0,
    });
  }
  const bucket = (date, field) => {
    const d = new Date(date);
    const m = byMonth.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (m) m[field]++;
  };
  allProposals.forEach((p) => bucket(p.createdAt, 'proposals'));
  allJobs.forEach((j) => bucket(j.createdAt, 'jobs'));

  // a5er 5 proposals
  const recentProposals = await Proposal.findAll({
    limit: 5,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Job, as: 'job', attributes: ['id', 'title'] },
      { model: User, as: 'freelancer', attributes: ['id', 'name'] },
    ],
  });

  // top 5 jobs (akthar bids)
  const topJobs = await Job.findAll({
    attributes: {
      include: [[sequelize.literal('(SELECT COUNT(*) FROM proposals WHERE proposals.jobId = Job.id)'), 'bidsCount']],
    },
    order: [[sequelize.literal('bidsCount'), 'DESC']],
    limit: 5,
  });

  return {
    users,
    admins,
    jobs,
    proposals,
    totalBudget,
    completedValue,
    byStatus,
    byMonth,
    recentProposals,
    topJobs: topJobs.map((j) => j.toJSON()),
  };
}

// ---------- Users ----------
const listUsers = () =>
  User.findAll({ attributes: ['id', 'name', 'email', 'role', 'createdAt'], order: [['id', 'ASC']] });

async function setRole(id, role, adminId) {
  if (!['user', 'admin'].includes(role)) throw httpError(400, 'role must be user or admin');
  if (Number(id) === Number(adminId)) throw httpError(400, 'You cannot change your own role');
  const user = await User.findByPk(id);
  if (!user) throw httpError(404, 'User not found');
  user.role = role;
  await user.save();
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// ykhassakh el user w kol chay marbout bih (transaction)
async function removeUser(id, adminId) {
  if (Number(id) === Number(adminId)) throw httpError(400, 'You cannot delete yourself');
  const user = await User.findByPk(id);
  if (!user) throw httpError(404, 'User not found');

  await sequelize.transaction(async (t) => {
    // 1. Get all jobs posted by this user
    const jobs = await Job.findAll({ where: { postedBy: id }, attributes: ['id'], transaction: t });
    const jobIds = jobs.map((j) => j.id);

    // 2. Get all proposals related to this user (as freelancer or via their jobs)
    const proposalsByJob = jobIds.length
      ? await Proposal.findAll({ where: { jobId: jobIds }, attributes: ['id'], transaction: t })
      : [];
    const proposalsByFreelancer = await Proposal.findAll({
      where: { freelancerId: id }, attributes: ['id'], transaction: t,
    });

    const allProposalIds = [
      ...new Set([
        ...proposalsByJob.map((p) => p.id),
        ...proposalsByFreelancer.map((p) => p.id),
      ]),
    ];

    // 3. Clean up messages, ratings, notifications linked to those proposals
    if (allProposalIds.length) {
      await Message.destroy({ where: { proposalId: allProposalIds }, transaction: t });
      await Rating.destroy({ where: { proposalId: allProposalIds }, transaction: t });
    }

    // 4. Clean up notifications sent to this user
    await Notification.destroy({ where: { userId: id }, transaction: t });

    // 5. Clean up messages sent by this user (edge case)
    await Message.destroy({ where: { senderId: id }, transaction: t });

    // 6. Delete proposals
    if (allProposalIds.length) {
      await Proposal.destroy({ where: { id: allProposalIds }, transaction: t });
    }

    // 7. Delete jobs
    if (jobIds.length) await Job.destroy({ where: { postedBy: id }, transaction: t });

    // 8. Delete the user
    await user.destroy({ transaction: t });
  });
}

// ---------- Jobs ----------
const listJobs = () =>
  Job.findAll({
    attributes: {
      include: [
        [sequelize.literal('(SELECT COUNT(*) FROM proposals WHERE proposals.jobId = Job.id)'), 'bidsCount'],
        [sequelize.literal('(SELECT name FROM users WHERE users.id = Job.postedBy)'), 'ownerName'],
      ],
    },
    order: [['createdAt', 'DESC']],
  });

async function removeJob(id) {
  const job = await Job.findByPk(id);
  if (!job) throw httpError(404, 'Job not found');
  await sequelize.transaction(async (t) => {
    await Proposal.destroy({ where: { jobId: id }, transaction: t });
    await job.destroy({ transaction: t });
  });
}

// ---------- Proposals ----------
function listProposals(status) {
  const where = status ? { status } : {};
  return Proposal.findAll({
    where,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Job, as: 'job', attributes: ['id', 'title'] },
      { model: User, as: 'freelancer', attributes: ['id', 'name', 'email'] },
    ],
  });
}

async function removeProposal(id) {
  const p = await Proposal.findByPk(id);
  if (!p) throw httpError(404, 'Proposal not found');
  await p.destroy();
}

module.exports = { stats, listUsers, setRole, removeUser, listJobs, removeJob, listProposals, removeProposal };