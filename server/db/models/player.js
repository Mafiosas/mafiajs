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

Player.afterUpdate(player => {
  const gameId = player.gameId;
  let aliveMafias, aliveVillagers;
  console.log("hello!!");
  return Player.findAll({
    where: {
      gameId: gameId,
      role: "Mafia",
      isAlive: true
    }
  })
    .then(mafias => {
      console.log("Where my mafias at", mafia);
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
      console.log("Alive mafia and players", aliveMafias, aliveVillagers);
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
        }
      }
    });
});

function gameOver(gameId) {
  let aliveMafias, alivePlayers;
  console.log("we here?!");
  // return Player.findAll({
  //   where: {
  //     gameId: gameId,
  //     role: "Mafia",
  //     isAlive: true
  //   }
  // })
  //   .then(mafias => {
  //     console.log("Where my mafias at", mafia);
  //     aliveMafias = mafias;
  //   })
  //   .then(() => {
  //     return Player.findAll({
  //       where: {
  //         gameId: gameId,
  //         isAlive: true,
  //         role: {
  //           [Op.ne]: "Mafia"
  //         }
  //       }
  //     });
  //   })
  //   .then(players => (alivePlayers = players))
  //   .then(() => {
  //     console.log("Alive mafia and players", aliveMafias, aliveVillagers);
  //     if (hasGameEnded(aliveMafias, aliveVillagers)) {
  //       if (didMafiaWin(aliveMafias)) {
  //         Game.update(
  //           {
  //             winner: didMafiaWin(aliveMafias) ? "Mafia" : "Villagers"
  //           },
  //           {
  //             where: {
  //               gameId: gameId
  //             }
  //           }
  //         );
  //       }
  //     }
  //   });
}

module.exports = Player;
