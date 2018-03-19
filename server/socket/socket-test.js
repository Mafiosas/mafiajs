const should = require("should");
const io = require("socket.io-client"),
  server = require("./index");

const socketURL = "https://localhost:5000";

const options = {
  transports: ["websocket"],
  "force new connection": true
};

const player1 = { name: "Dani" };
const player2 = { name: "Britt" };
const player3 = { name: "Gabby" };
const game = "Mafia"

describe("Our mafia game", () {


})
