const Sequelize = require("sequelize");
const db = require("../db");

const Round = db.define("round", {
  number: {
    type: Sequelize.INTEGER
  },
  isCurrent: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  killed: {
    type: Sequelize.STRING
  },
  saved: {
    type: Sequelize.STRING
  },
  died: {
    type: Sequelize.STRING
  }
});

Round.beforeCreate = function(round) {
  return this.findAll({
    where: {
      gameId: round.gameId
    }
  }).then(rounds => {
    console.log(
      "inside hook,",
      rounds.length,
      "and the the round we on is,",
      round
    );
    round.number = rounds.length + 1;
  });
};

module.exports = Round;
