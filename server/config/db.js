const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', process.env.DB_STORAGE || './database.sqlite'),
  logging: false
});

module.exports = sequelize;
