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
    values: ["Lead Mafia", "Mafia", "Doctor", "Detective", "Civilian", "Dead"]
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
  },
  creator: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

Player.prototype.isMafia = function() {
  return this.role === "Mafia" || this.role === "Lead Mafia";
};

//write a prototype method that fires when lead mafia is killed, try to find another mafia to assign lead mafia, if not game is over

Player.afterUpdate(player => {
  const gameId = player.gameId;
  let aliveMafias, alivePlayers;
  //did lead mafia die?
  return Player.findAll({
    where: {
      gameId: gameId,
      role: {
        [Op.or]: ["Mafia", "Lead Mafia"]
      },
      isAlive: true
    }
  })
    .then(mafias => {
      console.log("what do mafias look like in hook?", mafias);
      aliveMafias = mafias;
    })
    .then(() => {
      return Player.findAll({
        where: {
          gameId: gameId,
          isAlive: true,
          role: {
            [Op.or]: ["Civilian", "Doctor", "Detective"]
          }
        }
      });
    })
    .then(players => (alivePlayers = players))
    .then(() => {
      if (hasGameEnded(aliveMafias, alivePlayers)) {
        return Game.update(
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
