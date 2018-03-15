const Sequelize = require('sequelize');
const db = require('../db');

const Player = db.define('player', {
  cookieId: {
    type: Sequelize.STRING
  },
  role: {
    type: Sequelize.ENUM,
    values: ['Mafia', 'Doctor', 'Detective', 'Civilian']
  },
  name: {
    type: Sequelize.STRING
  },
  isAlive: {
    type: Sequelize.BOOLEAN
  }
})

Player.prototype.isMafia = function() {
  return this.role === 'Mafia'
}
