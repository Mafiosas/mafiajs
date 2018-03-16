// const Sequelize = require("sequelize");
// const pkg = require("../../package.json");

// const db = new Sequelize("postgres://localhost:5432/mafiajs", null, null, {
//   host: "localhost",
//   dialect: "postgres"
// });

// module.exports = db;

const Sequelize = require("sequelize");
const pkg = require("../../package.json");

const databaseName =
  pkg.name + (process.env.NODE_ENV === "test" ? "-test" : "");

const db = new Sequelize(
  process.env.DATABASE_URL || `postgres://localhost:5432/${databaseName}`,
  {
    logging: false
  }
);
module.exports = db;
