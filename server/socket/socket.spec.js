const should = require("should");
const assert = require("assert");
const io = require("socket.io-client"),
  server = require("./index");
const db = require("../db/index");
const { Death, Game, Player, Round } = require("../db/models/index");

describe("Our mafia game", () => {
  let client1, client2;
  beforeEach(done => {
    client1 = io("http://localhost:8080", {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true
    });
    client2 = io("http://localhost:8080", {
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
    client2.on("connect", () => {
      console.log("2 worked.....!!!!!");
      done();
    });
    client2.on("disconnect", () => {
      console.log("2 disconnected......");
    });
  });

  it("client 1 emits join game", done => {
    console.log("client 1 !!!!!!!");
    client1.emit("joinGame", 1);
    done();
  });

  it("client 2 emits join game", done => {
    console.log("CLIENT 2 !!!!!!");
    client2.emit("joinGame", 2);
    done();
  });

  afterEach(done => {
    if (client1.connected) {
      console.log("1 disconnecting...");
      client1.disconnect();
    } else {
      console.log("no connection to break .....");
    }

    if (client2.connected) {
      console.log("2 disconnecting...");
      client2.disconnect();
    } else {
      console.log("no connection to break .....");
    }
    done();
  });

  // it("Should broadcast a join game for two clients", done => {
  //   client1.on("connect", () => {
  //     console.log("Connected in the test!", client1.connected, client1.id); // true
  //     //client1.emit("joinGame", 1);
  //     //console.log("this is game", client1);
  //     // client2.on("connect", () => {
  //     //   client2.emit("joinGame", 2);
  //     //   console.log("do we get here 3");
  //     // });

  //     // client2.on("getRoles", () => {
  //     //   client2.disconnect();
  //     //   console.log("do we get here 4");
  //     // });
  //     client1.emit("joinGame", 1);
  //   });
  //   client2.on("connect", () => {
  //     console.log("player 2 connected!");
  //     client2.emit("joinGame", 1);
  //   });
  //   done();
  // });
  // it("Emit game start twice", done => {
  //   client1.emit("gameStart", 1);
  //   client2.emit("gameStart", 1);
  //   done();
  // });
});
