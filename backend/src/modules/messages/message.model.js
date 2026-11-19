const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Message = sequelize.define(
  'Message',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    proposalId: { type: DataTypes.INTEGER, allowNull: false },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false, validate: { len: [1, 1000] } },
  },
  {
    tableName: 'messages',
    indexes: [{ fields: ['proposalId'] }],
  }
);

module.exports = Message;