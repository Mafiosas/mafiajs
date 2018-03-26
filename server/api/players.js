const router = require("express").Router();
const { Player, Game } = require("../db/models");
const OpenTok = require("opentok");

module.exports = router;

//api/players
router.get("/me", (req, res, next) => {
  Player.findById(req.session.user)
    .then(player => {
      if (player.role === "Dead") {
        return player
          .update({
            isAlive: false
          })
          .then(updated => {
            res.json(updated);
          });
      } else {
        res.json(player);
      }
    })
    .catch(next);
});

router.get("/:gameId", (req, res, next) => {
  const gameId = req.params.gameId;
  Player.findAll({
    attributes: ["name", "id"],
    where: {
      gameId: gameId,
      isAlive: true
    }
  })
    .then(users => res.json(users))
    .catch(next);
});

router.post("/", (req, res, next) => {
  Game.findById(req.body.gameId) //make sure to include gameId in the req.body!
    .then(game => {
      let opentok = new OpenTok(
        "46085992",
        "06b37a1f205fa56ddf7231f07889c585cbc1abb2"
      );
      let token = opentok.generateToken(game.sessionId);
      req.body.token = token;
      return Player.create(req.body);
    })
    .then(player => {
      req.session.user = player.id;

      res.json(player);
    })
    .catch(next);
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
