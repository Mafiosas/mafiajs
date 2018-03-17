const Sequelize = require("sequelize");
const db = require("../db");
const Player = require("./player");

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
  },
<<<<<<< HEAD
  inProgress: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
=======
  sessionId: {
    type: Sequelize.TEXT
>>>>>>> master
  }
});

Game.prototype.hasEnded = function() {
  return !!this.winner;
};

module.exports = Game;
