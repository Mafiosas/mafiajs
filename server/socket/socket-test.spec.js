const should = require("should");
const io = require("socket.io-client");
const server = require("./index");

const socketURL = "https://localhost:5000";

const options = {
  transports: ["websocket"],
  "force new connection": true
};

const player1 = { name: "Dani" };
const player2 = { name: "Britt" };
const player3 = { name: "Gabby" };
const game = { roomName: "Mafia", id: 1 };

describe("Our mafia game", () => {
  it("client should join the right game", done => {
    const client = io.connect(socketURL, options);
    client.emit("joinGame", 1);
    console.log("server", server);
    server.on("joinGame", gameId => {
      gameId.should.equal(1);
    });
  });
});
