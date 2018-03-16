const Sequelize = require("sequelize");
const pkg = require("../../package.json");

// const databaseName =
//   pkg.name + (process.env.NODE_ENV === "test" ? "-test" : "");

// const db = new Sequelize(process.env.DATABASE_URL, {
//   logging: false
// });

// const db = new Sequelize(
//   ("postgres://localhost:5432/mafiajs", null, null, { logging: false })
// );

// (URL, username, password, db, port

const db = new Sequelize("postgres://localhost:5432/mafiajs", null, null, {
  host: "localhost",
  dialect: "postgres"
});

module.exports = db;
