const Proposal = require('../proposals/proposal.model');
const Job = require('../jobs/job.model');
const User = require('../users/user.model');
const Message = require('./message.model');
const notifications = require('../notifications/notification.service');

const httpError = (status, message) => Object.assign(new Error(message), { status });

// ken el freelancer wala saheb el job ynajmou yدkhlou lel chat
async function getProposalFor(proposalId, userId) {
  const proposal = await Proposal.findByPk(proposalId, { include: [{ model: Job, as: 'job' }] });
  if (!proposal) throw httpError(404, 'Proposal not found');

  const isFreelancer = Number(proposal.freelancerId) === Number(userId);
  const isOwner = Number(proposal.job.postedBy) === Number(userId);
  if (!isFreelancer && !isOwner) throw httpError(403, 'You are not part of this conversation');

  return { proposal, isFreelancer };
}

async function list(proposalId, userId) {
  const { proposal } = await getProposalFor(proposalId, userId);

  const [freelancer, owner, messages] = await Promise.all([
    User.findByPk(proposal.freelancerId, { attributes: ['id', 'name'] }),
    User.findByPk(proposal.job.postedBy, { attributes: ['id', 'name'] }),
    Message.findAll({
      where: { proposalId },
      order: [['createdAt', 'ASC']],
      include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }],
    }),
  ]);

  return {
    proposal: {
      id: proposal.id,
      status: proposal.status,
      jobTitle: proposal.job.title,
      freelancer,
      owner,
    },
    messages,
  };
}

async function send(proposalId, userId, body) {
  const text = String(body || '').trim();
  if (text.length < 1 || text.length > 1000) throw httpError(400, 'Message must be 1 to 1000 characters');

  const { proposal, isFreelancer } = await getProposalFor(proposalId, userId);
  const message = await Message.create({ proposalId, senderId: userId, body: text });

  // n3ayetou lel tarf el thani
  const to = isFreelancer ? proposal.job.postedBy : proposal.freelancerId;
  await notifications.notify(to, `New message about "${proposal.job.title}"`, `/proposals/chat/${proposal.id}`);

  return message;
}

module.exports = { list, send };