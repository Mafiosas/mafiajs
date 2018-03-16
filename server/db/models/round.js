const Sequelize = require("sequelize");
const db = require("../db");

const Round = db.define("round", {
  number: {
    type: Sequelize.INTEGER
  },
  isCurrent: {
    type: Sequelize.BOOLEAN
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

module.exports = Round;
