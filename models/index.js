const Sequelize = require('sequelize');

//const env = process.env.NODE_ENV || 'development';
const env = 'production';

const config = require('../config/config')[env];

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;