const should = require("should");
const io = require("socket.io-client"),
  server = require("./index");

const socketURL = "https://localhost:8080";

const options = {
  transports: ["websocket"],
  "force new connection": true
};

const player1 = { name: "Dani" };
const player2 = { name: "Britt" };
const player3 = { name: "Gabby" };
const game = "Mafia";

describe("Our mafia game", () => {
  it("Should broadcast a join game", done => {
    var client1 = io.connect(socketURL, options);
    console.log("do we get here 1");

    client1.on("connect", data => {
      client1.emit("connection name", player1);
      console.log("do we get here 2");

      var client2 = io.connect(socketURL, options);

      client2.on("connect", data => {
        client2.emit("connection name", player2);
        console.log("do we get here 3");
      });

      client2.on("new user", function(usersName) {
        usersName.should.equal(player2.name + " has joined.");
        client2.disconnect();
        console.log("do we get here 4");
      });
    });

    var numUsers = 0;
    client1.on("new user", function(usersName) {
      numUsers += 1;
      console.log("do we get here 5");

      if (numUsers === 2) {
        usersName.should.equal(player2.name + " has joined.");
        client1.disconnect();
        console.log("do we get here 6");
        done();
      }
    });
  });
});
