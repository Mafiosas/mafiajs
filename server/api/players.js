const router = require("express").Router();
const { Player } = require("../db/models");
module.exports = router;

//api/players/new
router.post("/new", (req, res, next) => {
  Player.create({
    name: req.body.name
    //game they belong to
    //cookieId: how do we get the cookie Id?
  }).then(player => res.json(player));
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
