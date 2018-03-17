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
  inProgress: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

Game.prototype.hasEnded = () => {
  return !!this.winner;
};

module.exports = Game;
