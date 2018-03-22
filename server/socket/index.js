const { Game, Round, Player } = require("../db/models");
const { whoToSendBack, shuffle, assignRoles } = require("../game.js");
const axios = require("axios");

module.exports = io => {
  const clients = {};
  io.on("connection", socket => {
    console.log(
      `A socket connection to the server has been made: ${socket.id}`
    );

    let game;

    socket.on("joinGame", ({ name, id, gameId }) => {
      game = gameId;
      socket.join(game);
      socket.userName = name;
      clients[id] = socket.id;
      socket.broadcast.to(game).emit("playerJoined", {
        name,
        id
      });
    });

    socket.on("disconnect", () => {
      console.log(`Connection ${socket.id} is no longer connected!`);
    });

    socket.on("gameStart", gameId => {
      io.to(game).emit("dark");
      setTimeout(() => {
        console.log("dark timer oveeeer"); //this works!
        io.to(game).emit("darkOver");
      }, 30000);
      Game.findById(gameId, {
        include: [Player]
      }).then(game => {
        if (game.inProgress) {
          return;
        }
        return game
          .update({
            inProgress: true
          })
          .then(updatedGame => {
            const idArray = game.players.map(el => el.id);
            const shuffledPlayers = assignRoles(shuffle(idArray));
            const creatingPlayers = game.players.map(player =>
              player.update(shuffledPlayers[player.id])
            );
            const newRound = Round.create({
              gameId: updatedGame.id,
              number: 1
            });
            return Promise.all([...creatingPlayers, newRound]);
          })
          .then(players => {
            players.pop();
            players.forEach(player => {
              if (clients[player.id]) {
                io.to(clients[player.id]).emit("role", player.role);
              }
            });
          })
          .catch(err => console.log(err));
      });
    });

    socket.on("darkData", darkData => {
      let { killed, saved, guess } = darkData;

      const gameId = darkData.gameId;
      if (guess) {
        Player.findById(guess)
          .then(foundPlayer => {
            if (foundPlayer.isMafia()) {
              io.to(socket.id).emit("DetectiveRight");
            } else {
              io.to(socket.id).emit("DetectiveWrong");
            }
          })
          .catch(err => console.error(err));
      } else {
        Round.findOne({
          where: {
            gameId: gameId,
            isCurrent: true
          }
        }).then(round => {
          if (!round) console.log("theres no round but we go on");
          if (killed && !round.saved) {
            return round.update({
              killed: killed
            });
          } else if (saved && !round.killed) {
            return round.update({
              saved: saved
            });
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
            //we're creating a new round more than once, we should put this in a .then

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
                      id: whoDied
                    }
                  }
                )
              );
            }
            Promise.all(proms).then(() => {
              Game.findById(gameId)
                .then(game => {
                  if (game.hasEnded()) {
                    console.log("Game is done here");
                    socket.broadcast.to(game).emit("gameOver", game.winner);
                  } else {
                    console.log("we should be creating a new round");
                    Round.findOrCreate({
                      where: {
                        gameId: gameId,
                        isCurrent: true
                      }
                    })
                      // .then(round => {
                      //   if (!round) {
                      //     console.log(
                      //       "queried the database, didnt find current round so were creating a new one"
                      //     );
                      //     return Round.create({
                      //       gameId: gameId
                      //     });
                      //   }
                      // })
                      .then(([round, boolean]) => {
                        if (round) {
                          console.log(
                            "were broadcasting daylight!!!! and here's the boolean:",
                            boolean
                          );
                          socket.broadcast.to(game).emit("daytime", person);
                        }
                      })
                      .catch(err => console.err);
                  }
                })
                .catch(err => console.err);
            });
          }
        });
      }
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

    // socket.on("startDarkTimer", () => {
    //   setTimeout(() => {
    //     console.log("dark timer oveeeer"); //this works!
    //     socket.broadcast.to(game).emit("darkOver");
    //   }, 10000);
    // });
  });
};
