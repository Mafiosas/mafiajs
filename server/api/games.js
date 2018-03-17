const Router = require("express").Router();
const Player = require("../db/models");
const Round = require("../db/models");
const Game = require("../db/models/");
const { Op } = require("sequelize");
const { hasGameEnded, didMafiaWin, whoToSendBack } = require("../game.js");
const OpenTok = require("opentok");

Router.post("/", (req, res, next) => {
  let opentok = new OpenTok(
    "46081452",
    "3d9f569b114ccfa5ae1e545230656c6adb5465d3"
  );
  openTok.createSession({ mediaMode: "routed" }, function(err, session) {
    if (err) {
      console.log(err);
      res.status(500).send({ error: "createSession error: ", err });
      return;
    }

    let sessionId = session.sessionId;

    token = opentok.generateToken(sessionId);
    res.setHeader("Content-Type", "application/json");
    res.send({
      apiKey: "46081452",
      sessionId: sessionId,
      token: token
    });
  });

  Game.create({ ...req.body, sessionId }).catch(next);
});

Router.get("/:gameId", (req, res, next) => {
  Game.findById(req.params.gameId).then(game => {
    // generate token
    token = opentok.generateToken(game.id);
    res.setHeader("Content-Type", "application/json");
    res.send({
      apiKey: "46081452",
      sessionId: game.id,
      token: token
    });
  });
});

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
