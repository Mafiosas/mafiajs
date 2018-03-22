const router = require("express").Router();
const { Death } = require("../db/models");

module.exports = router;

router.get("/", (req, res, next) => {
  Death.findAll()
    .then(deaths => res.json(deaths))
    .catch(next);
});
