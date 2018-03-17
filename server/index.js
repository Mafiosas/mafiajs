const path = require("path");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const db = require("./db");
const PORT = process.env.PORT || 8080;
const app = express();
const socketio = require("socket.io");
const routes = require("./api");
const OpenTok = require("opentok");
const Game = require("./db/models/game");

module.exports = app;

// logging middleware
const createApp = () => {
  app.use(morgan("dev"));

  // body parsing middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // static file-serving middleware
  app.use(express.static(path.join(__dirname, "..", "public")));

  //api routes
  app.use("/api", routes);

  // error handling
  app.use((err, req, res, next) => {
    console.error(err);
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || "Internal server error.");
  });

  // development error handler
  // will print stacktrace
  if (app.get("env") === "development") {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render("error", {
        message: err.message,
        error: err
      });
    });
  }
};

const startListening = () => {
  const server = app.listen(PORT, () =>
    console.log(`Hanging out on port ${PORT}`)
  );

  const io = socketio(server);
  require("./socket")(io);
};

const syncDb = () => db.sync();

if (require.main === module) {
  syncDb()
    .then(createApp)
    .then(startListening);
} else {
  createApp();
}

// //to disconnect participant from OpenTok session
// opentok.forceDisconnect(sessionId, connectionId, function(error) {
//   if (error) return console.log("error:", error);
// });
