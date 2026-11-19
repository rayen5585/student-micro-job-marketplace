const { fn, col } = require('sequelize');
const Proposal = require('../proposals/proposal.model');
const Job = require('../jobs/job.model');
const Rating = require('./rating.model');
const notifications = require('../notifications/notification.service');

const httpError = (status, message) => Object.assign(new Error(message), { status });

// Client yRate el freelancer ba3d ma el gig ytkamel
async function create(proposalId, clientId, { stars, comment }) {
  const s = Number(stars);
  if (!Number.isInteger(s) || s < 1 || s > 5) throw httpError(400, 'stars must be an integer between 1 and 5');

  const proposal = await Proposal.findByPk(proposalId, {
    include: [{ model: Job, as: 'job' }],
  });
  if (!proposal) throw httpError(404, 'Proposal not found');
  if (proposal.status !== 'Completed') throw httpError(400, 'You can only rate a completed proposal');
  if (Number(proposal.job.postedBy) !== Number(clientId)) throw httpError(403, 'Only the job owner can rate');

  let rating;
  try {
    rating = await Rating.create({
      proposalId,
      clientId,
      freelancerId: proposal.freelancerId,
      stars: s,
      comment: comment ? String(comment).trim().slice(0, 1000) : null,
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw httpError(409, 'You already rated this proposal');
    }
    throw err;
  }

  // notify the freelancer
  await notifications.notify(
    proposal.freelancerId,
    `You received a ${s}-star rating on "${proposal.job.title}"`,
    '/proposals/mine'
  );

  return rating;
}

// Résumé public d'un freelancer (moyenne + nombre)
async function freelancerSummary(freelancerId) {
  const rows = await Rating.findAll({
    where: { freelancerId },
    attributes: [
      [fn('AVG', col('stars')), 'avg'],
      [fn('COUNT', col('id')), 'count'],
      [fn('MIN', col('stars')), 'min'],
      [fn('MAX', col('stars')), 'max'],
    ],
    raw: true,
  });
  const r = rows[0] || {};
  return {
    freelancerId,
    avg: r.avg ? Number(Number(r.avg).toFixed(1)) : null,
    count: Number(r.count) || 0,
    min: r.min ? Number(r.min) : null,
    max: r.max ? Number(r.max) : null,
  };
}

module.exports = { create, freelancerSummary };