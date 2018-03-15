const Sequelize = require('sequelize');
const db = require('../db');

const Death = db.define('death', {
  story: {
    type: Sequelize.STRING
  }
})
