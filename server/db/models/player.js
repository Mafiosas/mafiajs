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

//change this to changeLeadMafia
Player.isLeadMafiaDead = function(gameId) {
  console.log("welcome to my database", gameId);
  // Player.findAll({
  //   where: {
  //     role: "Lead Mafia",
  //     gameId: game
  //   }
  // })
  //   .then(leadMaf => {
  // if (!leadMaf.length) {
  return Player.findAll({
    where: {
      role: "Mafia",
      gameId
    }
  })
    .then(mafias => {
      console.log("is anyone home in this if statements??", mafias.length);
      if (mafias.length) {
        console.log("we have arrived for drinks", mafias[0]);
        return mafias[0].update({
          role: "Lead Mafia"
        });
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
      aliveMafias = mafias;
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
      alivePlayers = players;

      return db.models.game.findById(gameId);
    })
    .then(found => {
      if (
        aliveMafias.length === 0 ||
        alivePlayers.length === 0 ||
        (alivePlayers.length === 1 && aliveMafias.length === 1)
      ) {
        const winner = aliveMafias.length === 0 ? "Villagers" : "Mafia";

        return found.update({ winner: winner });
      } else {
        return found;
      }
    })
    .catch(err => console.error(err));
};

module.exports = Player;
