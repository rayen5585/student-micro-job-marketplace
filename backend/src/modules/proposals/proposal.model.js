const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const STATUSES = ['Pending', 'Accepted', 'Rejected', 'Completed'];

const Proposal = sequelize.define(
  'Proposal',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    jobId: { type: DataTypes.INTEGER, allowNull: false },
    freelancerId: { type: DataTypes.INTEGER, allowNull: false },
    coverLetter: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { len: [20, 2000] },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 1 },
    },
    deliveryDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    status: {
      type: DataTypes.ENUM(...STATUSES),
      allowNull: false,
      defaultValue: 'Pending',
    },
  },
  {
    tableName: 'proposals',
    indexes: [{ unique: true, fields: ['jobId', 'freelancerId'] }],
  }
);

module.exports = Proposal;
module.exports.STATUSES = STATUSES;