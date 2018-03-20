const router = require("express").Router();
const { Player, Game } = require("../db/models");
const OpenTok = require("opentok");

module.exports = router;

//api/players
router.get("/me", (req, res, next) => {
  Player.findById(req.session.user)
    .then(player => res.json(player))
    .catch(next);
});

router.get("/:gameId", (req, res, next) => {
  const gameId = req.params.gameId;
  Player.findAll({
    attributes: ["name", "password"],
    where: {
      gameId: gameId
    }
  })
    .then(users => res.json(users))
    .catch(next);
});

router.post("/", (req, res, next) => {
  Game.findById(req.body.gameId) //make sure to include gameId in the req.body!
    .then(game => {
      let opentok = new OpenTok(
        "46081452",
        "3d9f569b114ccfa5ae1e545230656c6adb5465d3"
      );
      let token = opentok.generateToken(game.sessionId);

      Player.create({ ...req.body, token })
        .then(player => {
          req.session.user = player.id;
          res.json(player);
        })
        .catch(next);
    });
});

router.put("/dead/:playerId", (req, res, next) => {
  Player.findById(req.params.playerId).then(player => {
    return player
      .update({
        isAlive: false
      })
      .then(person => res.json(person));
  });
});

router.put("/alive/:playerId", (req, res, next) => {
  Player.findById(req.params.playerId).then(player => {
    return player
      .update({
        isAlive: true
      })
      .then(person => res.json(person));
  });
});
