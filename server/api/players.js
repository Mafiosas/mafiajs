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
