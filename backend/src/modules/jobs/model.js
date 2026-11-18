
const { DataTypes } = require('sequelize');
const sequelize = require('../../../utils/db');
const Job = sequelize.define('Job', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 100]
    }
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [20, 2000]
    }
  },

  budget: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 1,
      isDecimal: true
    }
  },

  skills: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },

  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM('Open', 'Assigned', 'Completed', 'Closed'),
    defaultValue: 'Open'
  }
});

module.exports = Job;
