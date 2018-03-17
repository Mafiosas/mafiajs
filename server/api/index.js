const Router = require("express").Router();
const Player = require("../db/models");
const Round = require("../db/models");
const { Op } = require("sequelize");
const game = require("./games");
const { hasGameEnded, didMafiaWin, whoToSendBack } = require("../game.js");

module.exports = Router;

Router.use("/game", game);

Router.get("/getInitialData", (req, res, next) => {
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

Router.get("/getRoundData", (req, res, next) => {
  const gameId = req.params.gameId;

  Round.findOne({
    where: {
      gameId: gameId,
      isCurrent: true
    }
  }).then(round => res.json(round));
});

Router.get("/getAllPlayers", (req, res, next) => {
  const gameId = req.params.gameId;
  Player.findAll({
    attributes: ["name"],
    where: {
      gameId: gameId
    }
  }).then(users => res.json(users));
});

Router.get("/whoWon", (req, res, next) => {
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

Router.post("/newRound", (req, res, next) => {
  Round.create()
    .then(round => round.setGame(req.params.gameId))

    .then(currentRound => res.json(currentRound));
});

Router.put("/newRound", (req, res, next) => {
  // backend sends socket about newRound starting with time, send roundId
  // frontend gets it and starts a countdown
  // backend sends socket about round ending
  // frontend gets it and emits a new event with info (saved, killed, null)
  // info might want to include gameId for ease (or send roundId back)
  // backend receives event and starts determining if it has all the info to let everyone know if round has ended

  //if check to see if it's a mafia making the request, if so:
  let killed = req.body.killed || null;
  //if check to see if it's a doctor making the request, if so:
  let saved = req.body.saved || null;
  let died;

  // {roundId, saved}
  // delete obj.roundId

  // we could theoretically have an object that has just {saved} or just {killed}, so that will be the ONLY thing Sequelize tries to update
  // then we can get rid of the first 2 updates and combine the elseIf
  // Round.update({
  //   where: {
  //     gameId: gameId,
  //     isCurrent: true
  //   }
  // }, req.body)

  const gameId = req.params.gameId;
  Round.findOne({
    where: {
      gameId: gameId,
      isCurrent: true
    }
  }).then(round => {
    if (killed && !round.saved) {
      return round.update({ killed: killed });
    } else if (saved && !round.killed) {
      return round.update({ saved: saved });
    } else if (saved && round.killed) {
      died = whoDies(round.killed, saved);
      // let proms = [
      //   round
      //   .update({
      //     saved: saved,
      //     died: died,
      //     isCurrent: false
      //   })
      // ]
      // if (died !== "none") {
      //   proms.push(Player.update(
      //     {
      //       isAlive: false
      //     },
      //     {
      //       where: {
      //         gameId: gameId,
      //         name: died
      //       }
      //     }
      //   ))
      // }
      // Promise.all(proms)
      //   .then(([round]) => {
      //   })
      round
        .update({
          saved: saved,
          died: died,
          isCurrent: false
        })
        .then(round => {
          if (round.died !== "none") {
            Player.update(
              {
                isAlive: false
              },
              {
                where: {
                  gameId: gameId,
                  name: round.died
                }
              }
            );
          }
          return round;
        })
        .then(round => {
          Game.findById(gameId).then(game => {
            if (game.hasEnded()) {
              res.json(game.Winner);
            } else {
              // create new round + vvvv
              //socket.emit('updateData') and if someone died (if round.died is truthy), send back round.died bc it's their name; else return round.saved and that's the name of who was saved
            }
          });
        });
    } else if (killed && round.saved) {
      person = whoToSendBack(killed, round.saved);
      const whoDied = person.saved ? null : person.killed;
      round
        .update({
          killed: killed,
          died: whoDied,
          isCurrent: false
        })
        .then(round => {
          if (round.died) {
            Player.update(
              {
                isAlive: false
              },
              {
                where: {
                  gameId: gameId,
                  name: round.died
                }
              }
            );
          }
          return round;
        })
        .then(round => {
          Game.findById(gameId).then(game => {
            if (game.hasEnded()) {
              res.json(game.Winner);
            } else {
              //socket.emit('updateData') and if someone died (if round.died is truthy), send back round.died bc it's their name; else return round.saved and that's the name of who was saved
            }
          });
        });
    }
  });
});
