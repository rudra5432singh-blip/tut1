const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Complaint = require('./Complaint');

const ComplaintVote = sequelize.define('ComplaintVote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  complaint_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Complaint,
      key: 'id'
    }
  },
  voter_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  // Ensure a user can only vote for a specific complaint once
  indexes: [
    {
      unique: true,
      fields: ['complaint_id', 'voter_id']
    }
  ]
});

module.exports = ComplaintVote;
