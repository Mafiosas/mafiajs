const Router = require("express").Router();
const Player = require("../db/models");
const Round = require("../db/models");
const { Op } = require("sequelize");
const { hasGameEnded, didMafiaWin, whoToSendBack } = require("../game.js");

Router.post("/newRound/:gameId", (req, res, next) => {
  Round.create()
    .then(round => round.setGame(req.params.gameId))
    .then(currentRound => res.json(currentRound));
});

Router.put("/newRound/:gameId", (req, res, next) => {
  //if check to see if it's a mafia making the request, if so:
  let killed = req.body.killed || null;
  //if check to see if it's a doctor making the request, if so:
  let saved = req.body.saved || null;
  let died;
  const gameId = req.params.gameId;
  Round.findOne({
    where: {
      gameId: gameId,
      isCurrent: true
    }
  }).then(round => {
    if (killed && !round.saved) {
      round.update({
        killed: killed
      });
    } else if (saved && !round.killed) {
      round.update({
        saved: saved
      });
    } else if (saved && round.killed) {
      person = whoToSendBack(round.killed, saved);
      const whoDied = person.saved ? null : person.killed;
      round
        .update({
          saved: saved,
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
