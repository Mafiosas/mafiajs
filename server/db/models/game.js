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
  },
  sessionId: {
    type: Sequelize.TEXT
  }
});

Game.prototype.hasEnded = function() {
  return !!this.winner;
};

Game.prototype.alivePlayers = async function() {
  const players = await Player.findAll({
    where: {
      gameId: this.id,
      isAlive: true
    }
  });
  console.log("these my players", players.length);
  return players.length;
};

module.exports = Game;
