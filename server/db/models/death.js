const Sequelize = require("sequelize");
const db = require("../db");

const Death = db.define("death", {
  storyForAll: {
    type: Sequelize.STRING
  },
  storyForKilled: {
    type: Sequelize.STRING
  }
});

module.exports = Death;
