const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Rating = sequelize.define(
  'Rating',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    proposalId: { type: DataTypes.INTEGER, allowNull: false, unique: true }, // rating wa7da l kol gig
    clientId: { type: DataTypes.INTEGER, allowNull: false },
    freelancerId: { type: DataTypes.INTEGER, allowNull: false },
    stars: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: 'ratings' }
);

module.exports = Rating;