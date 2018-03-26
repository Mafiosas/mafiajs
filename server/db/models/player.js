const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const db = require("../db");
const Game = require("./index");
const { whoToSendBack } = require("../../game.js");

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
  Player.findAll({
    where: {
      role: "Lead Mafia",
      gameId: game
    }
  })
    .then(leadMaf => {
      if (!leadMaf.length) {
        Player.findAll({
          where: {
            role: "Mafia",
            gameId: game
          }
        })
          .then(mafias => {
            if (mafias.length) {
              mafias[0].update({
                role: "Lead Mafia"
              });
            }
          })
          .catch(err => console.error(err));
      }
    })
    .catch(err => console.error(err));
};

Player.prototype.checkGameStatus = function() {
  const gameId = this.gameId;
  let aliveMafias, alivePlayers;
  return Player.findAll({
    where: {
      gameId: gameId,
      role: {
        [Op.or]: ["Mafia", "Lead Mafia"]
      }
    }
  })
    .then(mafias => {
      aliveMafias = mafias.map(maf => maf.dataValues);
    })
    .then(() => {
      return Player.findAll({
        where: {
          gameId: gameId,
          role: {
            [Op.or]: ["Civilian", "Doctor", "Detective"]
          }
        }
      });
    })
    .then(players => {
      alivePlayers = players.map(play => play.dataValues);
    })
    .then(() => {
      console.log(
        "right before the if statement to check who won",
        aliveMafias.length,
        alivePlayers.length
      );
      if (aliveMafias.length === 0 || alivePlayers.length === 0) {
        const winner = aliveMafias.length === 0 ? "Villagers" : "Mafias";

        return db.models.game
          .findById(gameId)
          .then(found => {
            return found.update({ winner: winner });
          })
          .catch(err => console.error(err));
      }
    });
};

module.exports = Player;
