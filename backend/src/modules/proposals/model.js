const { DataTypes } = require('sequelize');
const sequelize = require('../../utils/db');

const Proposal = sequelize.define('Proposal', {
  jobId:        { type: DataTypes.INTEGER, allowNull: false },
  freelancerId: { type: DataTypes.INTEGER, allowNull: false },
  message:      { type: DataTypes.TEXT, allowNull: false, validate: { len: [20, 1000] } },
  bidAmount:    { type: DataTypes.FLOAT, allowNull: false, validate: { min: 1 } },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected', 'Completed'),
    defaultValue: 'Pending'
  }
});

module.exports = Proposal;