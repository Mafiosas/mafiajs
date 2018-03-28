const assert = require("assert");
const io = require("socket.io-client"),
  server = require("./index");
const db = require("../db/index");
const { Death, Game, Player, Round } = require("../db/models/index");

describe("Our mafia game", () => {
  let client1;
  beforeEach(done => {
    client1 = io("http://localhost:8080", {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true
    });
    client1.on("connect", () => {
      console.log("1 worked.....!!!!!");
    });
    client1.on("disconnect", () => {
      console.log("1 disconnected......");
    });
  });

  it("client 1 emits join game", done => {
    console.log("client 1 !!!!!!!");
    client1.emit("joinGame", 1);
    done();
  });

  afterEach(done => {
    if (client1.connected) {
      console.log("1 disconnecting...");
      client1.disconnect();
    } else {
      console.log("no connection to break .....");
    }

    done();
  });
});
