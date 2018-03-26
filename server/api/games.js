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
  })
    .then(activeGames => res.json(activeGames))
    .catch(next);
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
    "46085992",
    "06b37a1f205fa56ddf7231f07889c585cbc1abb2"
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
        req.body.creator = true;
        Player.create(req.body)
          .then(player => {
            req.session.user = player.id;
            return player;
          })
          .then(newPlayer => {
            res.json({ createdGame, newPlayer });
          });
      })
      .catch(next);
  });
});

// router.post("/newRound/:gameId", (req, res, next) => {
//   Round.create()
//     .then(round => round.setGame(req.params.gameId))
//     .then(currentRound => res.json(currentRound));
// });
