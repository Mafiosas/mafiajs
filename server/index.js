const path = require("path");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
// const db = require("./db/db");
const PORT = process.env.PORT || 8080;
const app = express();
const socketio = require("socket.io");
module.exports = app;

// logging middleware
app.use(morgan("dev"));

// body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//api routes
// app.use("/", require("./api"));

// static file-serving middleware
app.use(express.static(path.join(__dirname, "..", "public")));

// error handling
app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Internal server error.");
});

const server = app.listen(PORT, () =>
  console.log(`Hanging out on port ${PORT}`)
);

const io = socketio(server);
require("./socket")(io);

// const syncDb = () => db.sync();
