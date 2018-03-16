const Router = require("express").Router();
const Player = require("../db/models");
const Round = require("../db/models");
const { Op } = require("sequelize");
const { hasGameEnded, didMafiaWin, whoToSendBack } = require("../game.js");

Router.use("/players", require("./players"));
Router.use("/game", require("./games"));

Router.get("/getInitialData/:gameId", (req, res, next) => {
  const gameId = req.params.gameId;
  Player.findOne({
    where: {
      cookieId: req.body.cookieId
    }
  }).then(player => {
    if (player.isMafia) {
      Player.findAll({
        where: {
          gameId: gameId,
          role: "Mafia"
        }
      }).then(mafiaMembers => {
        player.mafiaMembers = mafiaMembers;
        res.json(player);
      });
    } else {
      res.json(player);
    }
  });
});

Router.get("/getRoundData/:gameId", (req, res, next) => {
  const gameId = req.params.gameId;
  Round.findOne({
    where: {
      gameId: gameId,
      isCurrent: true
    }
  }).then(round => res.json(round));
});

Router.get("/getAllPlayers/:gameId", (req, res, next) => {
  const gameId = req.params.gameId;
  Player.findAll({
    attributes: ["name"],
    where: {
      gameId: gameId
    }
  }).then(users => res.json(users));
});

Router.get("/whoWon/:gameId", (req, res, next) => {
  let alivePlayers, aliveMafias;
  const gameId = req.params.gameId;

  Player.findAll({
    where: {
      gameId: gameId,
      role: "Mafia",
      isAlive: true
    }
  }).then(mafias => (aliveMafias = mafias.length));

  Player.findAll({
    where: {
      gameId: gameId,
      isAlive: true,
      role: {
        [Op.ne]: "Mafia"
      }
    }
  }).then(players => (alivePlayers = players.length));

  if (hasGameEnded(aliveMafias, alivePlayers)) {
    if (didMafiaWin(aliveMafias)) {
      res.json("Mafia won");
    } else {
      res.json("Villagers won");
    }
  } else {
    //game continues, emit socket
  }
});
