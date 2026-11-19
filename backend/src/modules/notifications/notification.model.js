const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Notification = sequelize.define(
  'Notification',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.STRING(255), allowNull: false },
    link: { type: DataTypes.STRING(255), allowNull: true },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    tableName: 'notifications',
    indexes: [{ fields: ['userId', 'isRead'] }],
  }
);

module.exports = Notification;