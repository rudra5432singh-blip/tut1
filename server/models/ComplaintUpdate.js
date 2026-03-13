const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ComplaintUpdate = sequelize.define('ComplaintUpdate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  complaint_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ComplaintUpdate;
