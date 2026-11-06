const Proposal = require('./proposal.model');
const Job = require('../jobs/job.model');
const User = require('../users/user.model');

// Proposal tخصّ job wa7ed w freelancer wa7ed
Proposal.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Proposal.belongsTo(User, { foreignKey: 'freelancerId', as: 'freelancer' });

// Job ynajem ykoun 3andou barcha proposals
Job.hasMany(Proposal, { foreignKey: 'jobId', as: 'proposals' });