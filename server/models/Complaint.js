const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending'
  },
  urgency: {
    type: DataTypes.STRING,
    allowNull: true
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  workflow: {
    type: DataTypes.JSON,
    allowNull: true
  },
  current_stage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estimated_resolution_time: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  votes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  citizen_recommendation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  authority_recommendation: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Complaint;
