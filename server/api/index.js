const Router = require("express").Router();
const game = require("./games");
const player = require("./players");
const facts = require("./facts");
const deaths = require("./deaths");

module.exports = Router;

Router.use("/game", game);
Router.use("/players", player);
Router.use("/facts", facts);
Router.use("/deaths", deaths);
