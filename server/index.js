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
  app.use("/", routes);

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

  // const opentok = new OpenTok(
  //   "46081452",
  //   "3d9f569b114ccfa5ae1e545230656c6adb5465d3"
  // );
  // opentok.createSession(function(err, session) {
  //   if (err) return console.log(err);

  //   app.set("sessionId", session.sessionId);
  // });
};

const startListening = () => {
  const server = app.listen(PORT, () =>
    console.log(`Hanging out on port ${PORT}`)
  );

  const io = socketio(server);
  require("./socket")(io);
};

const syncDb = () => db.sync({ force: true });

if (require.main === module) {
  syncDb()
    .then(createApp)
    .then(startListening);
} else {
  createApp();
}

// // The session will the OpenTok Media Router:
// opentok.createSession({mediaMode:"routed"}, function(err, session) {
//   if (err) return console.log(err);

//   // save the sessionId
//   db.save('session', session.sessionId, done);
// });

// // A Session with a location hint
// opentok.createSession({location:'12.34.56.78'}, function(err, session) {
//   if (err) return console.log(err);

//   // save the sessionId
//   db.save('session', session.sessionId, done);
// });

// // A Session with an automatic archiving
// opentok.createSession({mediaMode:'routed', archiveMode:'always'}, function(err, session) {
//   if (err) return console.log(err);

//   // save the sessionId
//   db.save('session', session.sessionId, done);
// });

// // Generate a Token from just a sessionId (fetched from a database)
// token = opentok.generateToken(sessionId);

// //to disconnect participant from OpenTok session
// opentok.forceDisconnect(sessionId, connectionId, function(error) {
//   if (error) return console.log("error:", error);
// });
