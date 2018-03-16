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
  }
});

Player.prototype.isMafia = function() {
  return this.role === "Mafia";
};

Player.hook("afterUpdate", async player => {
  //const gameId = player.gameId;
  const aliveMafia = await Player.findAll({
    where: {
      gameId: gameId,
      role: "Mafia",
      isAlive: true
    }
  });

  const aliveVillagers = await Player.findAll({
    where: {
      gameId: gameId,
      isAlive: true,
      role: {
        [Op.ne]: "Mafia"
      }
    }
  });

  if (hasGameEnded(aliveMafias, aliveVillagers)) {
    if (didMafiaWin(aliveMafias)) {
      Game.update(
        {
          winner: didMafiaWin(aliveMafias) ? "Mafia" : "Villagers"
        },
        {
          where: {
            gameId: gameId
          }
        }
      );
      // } else {
      // Game.update(
      //   {
      //     winner: "Villagers"
      //   },
      //   {
      //     where: {
      //       gameId: gameId
      //     }
      //   }
      // );
    }
  }
});

module.exports = Player;
