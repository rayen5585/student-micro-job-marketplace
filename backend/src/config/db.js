require('dotenv').config();
const { Sequelize } = require('sequelize');

// Use environment variables (from .env), fallback to sensible defaults
const sequelize = new Sequelize(
  process.env.DB_NAME || 'student_micro_job_marketplace',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
