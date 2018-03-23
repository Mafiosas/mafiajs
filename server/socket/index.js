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
        if (!round) {
          return;
        }
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

            let proms = [updatedRound.update(roundUpdate)];
            if (whoDied) {
              proms.push(
                Player.update(
                  {
                    isAlive: false,
                    role: "Dead"
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
                    socket.broadcast
                      .to(gameId)
                      .emit("updatedGameOver", updatedGame.winner);
                  } else {
                    Round.create({
                      gameId: gameId,
                      isCurrent: true
                    })
                      .then(round => {
                        if (round) {
                          io.to(gameId).emit("daytime", person);
                        }
                      })
                      .catch(err => console.error(err));
                  }
                })
                .catch(err => console.error(err));
            });
          })
          .catch(err => console.error(err));
      });
    });

    socket.on("myVote", voteData => {
      io.to(game).emit("myVote", voteData);
    });

    socket.on("startDayTimerPreVotes", () => {
      setTimeout(() => {
        socket.broadcast.to(game).emit("getVotes");
      }, 300000);
    });

    let voteArray = [];
    let voted = {};
    socket.on("voteData", voteData => {
      voteArray.push(voteData);

      Player.findAll({
        where: {
          isAlive: true,
          gameId: voteData.gameId
        }
      });

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
        let killBoolean;
        Player.findById(votedOut)
          .then(player => {
            if (
              player.dataValues.role === "Mafia" ||
              player.dataValues.role === "Lead Mafia"
            ) {
              killBoolean = true;
            } else {
              killBoolean = false;
            }
            return player.update(
              {
                isAlive: false,
                role: "Dead"
              },
              {
                where: {
                  id: votedOut
                }
              }
            );
          })
          .then(player => {
            Game.findById(player.gameId)
              .then(currentGame => {
                if (currentGame.hasEnded()) {
                  io.to(currentGame).emit("gameOver");
                } else {
                  io
                    .to(currentGame)
                    .emit("votesAreIn", { player, killBoolean });
                  setTimeout(() => {
                    io.to(game).emit("dark");
                  }, 300000);
                  //we need to have an on 'votesarein' that changes the front end rendering and lets everyone know who died and if they were mafia, gives a few seconds,then goes back to dark
                }
              })
              .catch(err => console.error(err));
          })
          .catch(err => console.error(err));
      }
    });
  });
};
