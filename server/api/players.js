const router = require("express").Router();
const { Player, Game } = require("../db/models");
const OpenTok = require("opentok");

module.exports = router;

//api/players
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
