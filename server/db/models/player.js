const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const db = require("../db");
const Game = require("./game");
const { hasGameEnded, didMafiaWin, whoToSendBack } = require("../../game.js");

const Player = db.define("player", {
  cookieId: {
    type: Sequelize.STRING
  },
  role: {
    type: Sequelize.ENUM,
    values: ["Mafia", "Doctor", "Detective", "Civilian"]
  },
  name: {
    type: Sequelize.STRING
  },
  isAlive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  token: {
    type: Sequelize.TEXT
  }
});

Player.prototype.isMafia = function() {
  return this.role === "Mafia";
};

Player.afterUpdate(player => {
  const gameId = player.gameId;
  let aliveMafias, alivePlayers;
  return Player.findAll({
    where: {
      gameId: gameId,
      role: "Mafia",
      isAlive: true
    }
  })
    .then(mafias => {
      aliveMafias = mafias;
    })
    .then(() => {
      return Player.findAll({
        where: {
          gameId: gameId,
          isAlive: true,
          role: {
            [Op.ne]: "Mafia"
          }
        }
      });
    })
    .then(players => (alivePlayers = players))
    .then(() => {
      if (hasGameEnded(aliveMafias, alivePlayers)) {
        Game.update(
          {
            winner: didMafiaWin(aliveMafias) ? "Mafia" : "Villagers"
          },
          {
            where: {
              id: gameId
            }
          }
        );
      }
    })
    .catch(err => console.log(err));
});

module.exports = Player;
