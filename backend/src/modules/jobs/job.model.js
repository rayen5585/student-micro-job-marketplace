const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Job = sequelize.define(
  'Job',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    budget: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    postedBy: { type: DataTypes.INTEGER, allowNull: false },

    // ⭐ jdid: tags mta3 skills, ytkhazznou ka texte JSON: '["Design","Logo"]'
    skills: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        try {
          return JSON.parse(this.getDataValue('skills') || '[]');
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue('skills', JSON.stringify(Array.isArray(value) ? value : []));
      },
    },

    // ⭐ jdid: deadline (ken null ya3ni mouch urgent)
    deadline: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'jobs',
    // ⭐ jdid: FULLTEXT index = "Text-indexing search" mta3 el sujet
    indexes: [{ type: 'FULLTEXT', name: 'jobs_fulltext', fields: ['title', 'description'] }],
  }
);

module.exports = Job;