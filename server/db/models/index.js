const Death = require("./death");
const Game = require("./game");
const Player = require("./player");
const Round = require("./round");

Game.hasMany(Round);
Round.belongsTo(Game);

Game.hasMany(Player);
Player.belongsTo(Game);

module.exports = {
  Death,
  Game,
  Player,
  Round
};
