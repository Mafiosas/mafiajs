const should = require("should");
const assert = require("assert");
const io = require("socket.io-client"),
  server = require("./index");

//startListening();

//const socketURL = "https://localhost:8080";
const client1 = io("http://localhost:8080");
const client2 = io("http://localhost:8080");
// const options = {
//   //  transports: ["websocket"],
//   "force new connection": true
// };

const player1 = { name: "Dani" };
const player2 = { name: "Britt" };
const player3 = { name: "Gabby" };
const game = "Mafia";

//var intercept = require("socket.io-intercept");
// Make sure to call this before server.listen(port)
// Intercept connections on port 3000
//intercept(8080);

// Require your socket.io application that listens on port 3000.
//require("./index");

// Install and use socket.io-client in your spec (unit test).
// var client = require("socket.io-client")("http://localhost:8080/");
// client.on("connect", function() {
//   client.emit("gameStart", function(message) {
//     assert.equal(message, "1");
//     client.disconnect(); // Don't forget to disconnect.
//     assert.done(); // End the test.
//   });
// });

describe("Our mafia game", () => {
  it("Should broadcast a join game", done => {
    client1.on("connect", () => {
      console.log(
        "Connected in the test!",
        client1.connected,
        client1.id,
        client1.game
      ); // true
      client1.emit("joinGame", 1);

      client2.on("connect", () => {
        client2.emit("joinGame", 2);
        console.log("do we get here 3");
      });

      client2.on("getRoles", () => {
        client2.disconnect();
        console.log("do we get here 4");
      });
    });

    client1.emit("gameStart", 1); //this shuffles players in game 1
    client2.emit("gameStart", 2); //this shuffles players in game 2

    // var numUsers = 0;
    // client1.on("getRoles", () => {
    //   numUsers += 1;
    //   console.log("do we get here 5");

    //   if (numUsers === 2) {
    //     usersName.should.equal(player2.name + " has joined.");
    //     client1.disconnect();
    //     console.log("do we get here 6");
    //     done();
    //   }
    // });
    done();
  });
});
