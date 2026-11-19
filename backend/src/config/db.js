// Connexion à MySQL (XAMPP) avec l'ORM Sequelize
const mysql = require('mysql2/promise');       // sert seulement à créer la base au démarrage
const { Sequelize, DataTypes } = require('sequelize');

// 127.0.0.1 (IPv4) évite le problème de "localhost" en IPv6
const config = { host: '127.0.0.1', user: 'root', password: '' };

// L'objet sequelize représente la connexion à la base "micro_job"
const sequelize = new Sequelize('micro_job', config.user, config.password, {
  host: config.host,
  dialect: 'mysql',
  logging: false          // true afficherait chaque requête SQL générée dans le terminal
});

// Crée la base si besoin, puis les tables à partir des modèles
sequelize.init = async function () {
  const conn = await mysql.createConnection(config);          // connexion sans base choisie
  await conn.query('CREATE DATABASE IF NOT EXISTS micro_job CHARACTER SET utf8mb4');
  await conn.end();

  // on charge le modèle pour que sync() le connaisse (il crée la table "students" si elle n'existe pas)
  require('../models/Student');
  await sequelize.sync();

  // sync() ne modifie pas une table existante : on ajoute la colonne "role" si elle manque
  const queryInterface = sequelize.getQueryInterface();
  const columns = await queryInterface.describeTable('students');   // liste des colonnes actuelles
  if (!columns.role) {
    await queryInterface.addColumn('students', 'role', { type: DataTypes.STRING(20), allowNull: true });
  }
};

module.exports = sequelize;
