const Router = require("express").Router();
const Player = require("../db/models");
const Round = require("../db/models");
const { Op } = require("sequelize");
const game = require("./games");
const player = require("./players");
const facts = require("./mafiaFacts");

const { hasGameEnded, didMafiaWin, whoToSendBack } = require("../game.js");

module.exports = Router;

Router.use("/game", game);
Router.use("/players", player);
Router.use("/facts", facts);
