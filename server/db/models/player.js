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

Player.isLeadMafiaDead = function(game) {
  console.log("we have arrived in is lead mafia method");
  this.findAll({
    where: {
      role: "Lead Mafia",
      gameId: game
    }
  }).then(leadMaf => {
    if (!leadMaf) {
      Player.findAll({
        where: {
          role: "Mafia",
          gameId: game
        }
      }).then(mafias => {
        mafias[0].update({
          role: "Lead Mafia"
        });
      });
    }
  });
};

Player.afterUpdate(player => {
  const gameId = player.gameId;
  let aliveMafias, alivePlayers;
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
      aliveMafias = mafias.map(maf => maf.dataValues);
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
    .then(players => (alivePlayers = players.map(play => play.dataValues)))
    .then(() => {
      console.log(
        "alive mafias in hook:",
        aliveMafias,
        " and alivePlayers in hook: ",
        alivePlayers
      );
      if (hasGameEnded(aliveMafias, alivePlayers)) {
        const winner = didMafiaWin(aliveMafias) ? "Mafia" : "Villagers";
        return Game.update(
          {
            winner: winner
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
