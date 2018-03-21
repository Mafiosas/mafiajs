const Sequelize = require("sequelize");
const db = require("../db");

const Fact = db.define("fact", {
  fact: {
    type: Sequelize.TEXT
  }
});

module.exports = Fact;
