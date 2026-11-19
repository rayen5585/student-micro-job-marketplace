const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Modèle = description de la table "students" en JavaScript (une ligne de la table = un objet Student)
const Student = sequelize.define('Student', {
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: true },   // "sel:hash", vide pour un compte Google

  // En base, skills est du texte JSON : get/set le convertissent automatiquement en tableau
  skills: {
    type: DataTypes.TEXT,
    get() { return JSON.parse(this.getDataValue('skills') || '[]'); },   // texte -> tableau
    set(value) { this.setDataValue('skills', JSON.stringify(value || [])); } // tableau -> texte
  },

  portfolio: { type: DataTypes.STRING(255), defaultValue: '' },

  // Rôle choisi sur la page /role : 'client' ou 'freelancer' (vide tant qu'il n'a pas choisi)
  role: { type: DataTypes.STRING(20), allowNull: true }
}, {
  tableName: 'students',   // nom exact de la table existante
  underscored: true,       // createdAt (JavaScript) <-> created_at (MySQL)
  updatedAt: false         // la table n'a pas de colonne updated_at
});

module.exports = Student;
