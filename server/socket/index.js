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
        io.to(game).emit("darkOverForVillagers");
      }, 28000);
      setTimeout(() => {
        console.log("dark timer oveeeer"); //this works!
        io.to(game).emit("darkOverForMafia");
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

    socket.on("villagerChoice", data => {
      const { gameId, saved, guess } = data;
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
        })
          .then(round => {
            return round.update({
              saved: saved
            });
          })
          .catch(err => console.error(err));
      }
    });

    socket.on("darkData", darkData => {
      let { killed, gameId } = darkData;
      Round.findOne({
        where: {
          gameId: gameId,
          isCurrent: true
        }
      }).then(round => {
        if (!round) console.log("theres no round but we go on");
        return round
          .update({
            killed: killed
          })
          .then(updatedRound => {
            let actualKilled = updatedRound.killed;
            let actualSaved = updatedRound.saved;
            let person = whoToSendBack(actualKilled, actualSaved);
            const whoDied = person.saved ? null : person.killed;
            const roundUpdate = {
              died: whoDied,
              killed: actualKilled,
              isCurrent: false
            };
            //we're creating a new round more than once, we should put this in a .then

            let proms = [updatedRound.update(roundUpdate)];
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
                .then(updatedGame => {
                  if (updatedGame.hasEnded()) {
                    console.log("updatedGame is done here");
                    socket.broadcast
                      .to(gameId)
                      .emit("updatedGameOver", updatedGame.winner);
                  } else {
                    console.log("we should be creating a new round");
                    Round.create({
                      gameId: gameId,
                      isCurrent: true
                    })
                      .then(round => {
                        if (round) {
                          console.log(
                            "were broadcasting daylight!!!! and here's the person",
                            person
                          );
                          io.to(gameId).emit("daytime", person);
                        }
                      })
                      .catch(err => console.error(err));
                  }
                })
                .catch(err => console.error(err));
            });
          });
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

    let voteArray = [];
    let voted = {};
    socket.on("voteData", voteData => {
      const gameId = voteData.gameId;
      voteArray.push(voteData.id);

      if (io.sockets.length === voteArray.length) {
        for (let i = 0; i < voteArray.length; i++) {
          if (voted[voteArray[i]]) {
            voted[voteArray[i]]++;
          } else {
            voted[voteArray[i]] = 1;
          }
        }

        const votedOut = Object.keys(voted).reduce(
          (a, b) => (obj[a] > obj[b] ? a : b)
        );
        Player.update(
          {
            isAlive: false
          },
          {
            where: {
              id: votedOut
            }
          }
        )
          .then(player => {
            Game.findById(gameId)
              .then(currentGame => {
                if (currentGame.hasEnded()) {
                  io.to(currentGame).emit("gameOver");
                } else {
                  socket.broadcast.to(currentGame).emit("daytime", player);
                }
              })
              .catch(err => console.error(err));
          })
          .catch(err => console.error(err));
      }
    });
  });
};
