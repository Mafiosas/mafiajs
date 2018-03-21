const { Game, Round, Player } = require("../db/models");
const { whoToSendBack, shuffle, assignRoles } = require("../game.js");
const axios = require("axios");

module.exports = io => {
  io.on("connection", socket => {
    console.log(
      `A socket connection to the server has been made: ${socket.id}`
    );
    // console.log(
    //   "testing right before our socket.io request",
    //   Object.keys(io.sockets.sockets).length
    // );
    for (let key in io.sockets.sockets) {
      // console.log(
      //   "Key:",
      //   key,
      //   " and the other stuff: ",
      //   io.sockets.sockets[key]
      // );
    }

    let game;

    socket.on("testingJoin", payload => {
      console.log(
        "back end has received the front end test payload",
        socket.userName
      );
    });

    socket.on("joinGame", ({ name, id, gameId }) => {
      console.log("joinedgame", name, id, gameId);
      game = gameId;
      socket.join(game);
      socket.userName = name;
      console.log(
        "this is socket once joined to game, room:",
        socket.rooms,
        "username:",
        socket.userName
      );
      socket.broadcast.to(game).emit("playerJoined", { name, id });
    });

    socket.on("disconnect", () => {
      console.log(`Connection ${socket.id} is no longer connected!`);
    });

    socket.on("gameStart", async gameId => {
      console.log("gamestarted", gameId);
      //here we should update game table to inprogress: true (eager load players here)
      Game.findById(gameId, {
        include: [Player]
      })
        .then(game => {
          if (game.inProgress) {
            return;
          }
          return game
            .update({
              inProgress: true
            })
            .then(updatedGame => {
              const idArray = game.players.map(el => el.id);
              let shuffledPlayers = assignRoles(shuffle(idArray));
              return Promise.all(
                game.players.map(player =>
                  player.update(shuffledPlayers[player.id])
                )
              );
            })
            .then(() => {
              console.log(
                "testing right before our socket.io request",
                io.sockets
              );
              io.sockets
                .clients()
                .forEach(socket =>
                  console.log("This is one individual socket", socket)
                );
              //socket.broadcast.to(game).emit("getRoles");
            });
        })
        .catch(err => console.err);
      // const players = await Player.findAll({
      //   where: {
      //     gameId: gameId
      //   },
      //   attributes: ["name"]
      // });
      // const idArray = players.map(el => el.id);

      //let shuffledPlayers = assignRoles(shuffle(idArray));
      // let promsArray = [];
      // for (let i = 0; i < shuffledPlayers.length; i++) {
      //   console.log(shuffledPlayers[i].id, shuffledPlayers[i].role);
      //   promsArray.push(
      //     Player.update(
      //       {
      //         role: shuffledPlayers[i].role
      //       },
      //       {
      //         where: {
      //           id: shuffledPlayers[i].id
      //         }
      //       }
      //     )
      //   );
      // }
      // Promise.all(promsArray)
      //   .then(() => socket.broadcast.to(game).emit("getRoles"))
      //   .catch(err => console.err);
      //shuffle works, we sitll need to assign roles
    });

    socket.on("rolesAssigned", () => {
      console.log("inside roles assigned");
      socket.broadcast.to(game).emit("dark");
      setTimeout(() => {
        socket.broadcast.to(game).emit("darkOver");
      }, 10000);
    });

    socket.on("darkData", darkData => {
      let killed = darkData.killed || null;
      let saved = darkData.saved || null;

      const gameId = darkData.gameId;
      Round.findOne({
        where: {
          gameId: gameId,
          isCurrent: true
        }
      }).then(round => {
        if (killed && !round.saved) {
          return round.update({ killed: killed });
        } else if (saved && !round.killed) {
          return round.update({ saved: saved });
        } else {
          let actualKilled = killed || round.killed;
          let actualSaved = saved || round.saved;
          let person = whoToSendBack(actualKilled, actualSaved);
          const whoDied = person.saved ? null : person.killed;
          roundUpdate = {
            died: whoDied,
            killed: actualKilled,
            saved: actualSaved,
            isCurrent: false
          };

          let proms = [round.update(roundUpdate)];
          if (whoDied) {
            proms.push(
              Player.update(
                {
                  isAlive: false
                },
                {
                  where: {
                    gameId: gameId,
                    name: whoDied
                  }
                }
              )
            );
          }
          Promise.all(proms).then(() => {
            Game.findById(gameId).then(game => {
              if (game.hasEnded()) {
                socket.broadcast.to(game).emit("gameOver", game.winner);
              } else {
                socket.broadcast.to(game).emit("daytime", person);
              }
            });
          });
        }
      });
    });

    socket.on("startDayTimerPreVotes", () => {
      setTimeout(() => {
        socket.broadcast.to(game).emit("getVotes");
      }, 300000);
    });

    socket.on("startDayTimerPostVotes", () => {
      setTimeout(() => {
        socket.broadcast.to(game).emit("dark");
      }, 300000);
    });

    socket.on("voteData", voteData => {
      const gameId = voteData.gameId;
      let voteTable;
      if (voteTable[voteData.name]) {
        voteTable[voteData.name]++;
      } else {
        voteTable[voteData.name] = 1;
      }

      const votedOut = Object.keys(voteData).reduce(
        (a, b) => (obj[a] > obj[b] ? a : b)
      );

      Game.findById(gameId).then(currentGame => {
        if (currentGame.hasEnded()) {
          socket.broadcast.to(currentGame).emit("gameOver");
        } else {
          socket.broadcast.to(currentGame).emit("daytime", votedOut);
        }
      });
    });

    socket.on("startDarkTimer", () => {
      setTimeout(() => {
        console.log("dark timer oveeeer"); //this works!
        socket.broadcast.to(game).emit("darkOver");
      }, 10000);
    });
  });
};
