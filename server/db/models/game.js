const Sequelize = require("sequelize");
const db = require("../db");

const Game = db.define("game", {
  roomName: {
    type: Sequelize.STRING
  },
  password: {
    type: Sequelize.STRING
  },
  numPlayers: {
    type: Sequelize.INTEGER,
    defaultValue: 6
  },
  winner: {
    type: Sequelize.STRING,
    defaultValue: null
  }
});

Game.prototype.hasEnded = function() {
  return !!this.winner;
};

module.exports = Game;
