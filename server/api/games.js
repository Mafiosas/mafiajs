const router = require("express").Router();
const { Game, Round, Player } = require("../db/models");
const { Op } = require("sequelize");
const { hasGameEnded, didMafiaWin, whoToSendBack } = require("../game.js");
const OpenTok = require("opentok");

module.exports = router;

router.get("/", (req, res, next) => {
  Game.findAll({
    where: {
      inProgress: false
    }
  }).then(activeGames => res.json(activeGames));
});

router.get("/:gameId", (req, res, next) => {
  Game.findById(req.params.gameId)
    .then(game => {
      res.json(game);
    })
    .catch(next);
});

router.post("/new", (req, res, next) => {
  let opentok = new OpenTok(
    "46081452",
    "3d9f569b114ccfa5ae1e545230656c6adb5465d3"
  );

  opentok.createSession({ mediaMode: "routed" }, function(err, session) {
    if (err) {
      console.log(err);
      res.status(500).send({ error: "createSession error: ", err });
      return;
    }

    let sessionId = session.sessionId;
    req.body.sessionId = sessionId;

    Game.create(req.body)
      .then(createdGame => {
        let token = opentok.generateToken(createdGame.sessionId);
        req.body.token = token;
        req.body.gameId = createdGame.id;
        Player.create(req.body)
          .then(player => {
            req.session.user = player.id;

            return player;
          })
          .then(newPlayer => {
            console.log("new player", newPlayer);
            res.json({ createdGame, newPlayer });
          });
      })
      .catch(next);
  });
});

router.post("/newRound/:gameId", (req, res, next) => {
  Round.create()
    .then(round => round.setGame(req.params.gameId))
    .then(currentRound => res.json(currentRound));
});

// router.put("/newRound/:gameId", (req, res, next) => {
//   // backend sends socket about newRound starting with time, send roundId
//   // frontend gets it and starts a countdown
//   // backend sends socket about round ending
//   // frontend gets it and emits a new event with info (saved, killed, null)
//   // info might want to include gameId for ease (or send roundId back)
//   // backend receives event and starts determining if it has all the info to let everyone know if round has ended

//   //if check to see if it's a mafia making the request, if so:
//   let killed = req.body.killed || null;
//   //if check to see if it's a doctor making the request, if so:
//   let saved = req.body.saved || null;
//   let died;

//   const gameId = req.params.gameId;
//   Round.findOne({
//     where: {
//       gameId: gameId,
//       isCurrent: true
//     }
//   }).then(round => {
//     if (killed && !round.saved) {
//       return round.update({ killed: killed });
//     } else if (saved && !round.killed) {
//       return round.update({ saved: saved });
//     } else {
//       died = whoDies(round.killed || killed, round.saved || saved);
//       roundUpdate = {
//         died: died,
//         killed: killed || round.killed,
//         saved: saved || round.saved,
//         isCurrent: false
//       };

//       let proms = [round.update(roundUpdate)];
//       if (died !== "none") {
//         proms.push(
//           Player.update(
//             {
//               isAlive: false
//             },
//             {
//               where: {
//                 gameId: gameId,
//                 name: died
//               }
//             }
//           )
//         );
//       }
//       Promise.all(proms).then(round => {
//         Game.findById(gameId).then(game => {
//           if (game.hasEnded()) {
//             res.json(game.winner);
//           } else {
//             // create new round + vvvv
//             //socket.emit('updateData') and if someone died (if round.died is truthy), send back round.died bc it's their name; else return round.saved and that's the name of who was saved
//           }
//         });
//       });
//     }
//   });
// });
