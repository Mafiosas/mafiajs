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

    function gameRun(gameId) {
      io.to(game).emit("dark");
      setTimeout(() => {
        console.log("dark timer oveeeer"); //this works!
        io.to(game).emit("darkOverForVillagers");
      }, 25000);
      setTimeout(() => {
        console.log("dark timer oveeeer"); //this works!
        io.to(game).emit("darkOverForMafia");
      }, 30000);

      Game.findById(gameId, { include: [Player] }).then(game => {
        if (game.inProgress) {
          return;
        }
        return game
          .update({ inProgress: true })
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
    }

    socket.on("gameStart", gameId => {
      gameRun(gameId);
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
                    },
                    returning: true
                  }
                )
              );
            }
            Promise.all(proms)
              .then(resolved => {
                if (resolved[1]) {
                  console.log("what do proms look like", resolved[1][1][0]);
                  resolved[1][1][0].checkGameStatus();
                }
              })
              .then(() => {
                Game.findById(gameId)
                  .then(updatedGame => {
                    if (updatedGame.hasEnded()) {
                      socket.broadcast
                        .to(gameId)
                        .emit("gameOver", updatedGame.winner);
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

    socket.on("daytimeVotes", votes => {
      io.to(game).emit("resetVotes");
      let countedVotes = {};

      for (let key in votes) {
        if (!countedVotes[votes[key]]) countedVotes[votes[key]] = 1;
        else countedVotes[votes[key]]++;
      }

      const votedOutId = Object.keys(countedVotes).reduce(
        (a, b) => (countedVotes[a] > countedVotes[b] ? a : b)
      );
      let wasMafia;
      Player.findById(+votedOutId)
        .then(foundPlayer => {
          if (
            foundPlayer.role === "Mafia" ||
            foundPlayer.role === "Lead Mafia"
          ) {
            wasMafia = true;
            return foundPlayer.update({ role: "Dead" });
          } else {
            wasMafia = false;
            return foundPlayer.update({ role: "Dead" });
          }
        })
        .then(updatedPlayer => {
          console.log("whats the status here?", updatedPlayer);
          updatedPlayer.checkGameStatus();
          countedVotes = {};
          return updatedPlayer;
        })
        .then(updated => {
          return Game.findById(updated.gameId)
            .then(currentGame => {
              if (currentGame.hasEnded()) {
                console.log("game ended for real");
                io.to(currentGame.id).emit("gameOver", currentGame.winner);
              } else {
                console.log("here we go again");
                Player.isLeadMafiaDead(currentGame.id);
                io
                  .to(currentGame.id)
                  .emit("votesData", updated.name, !!wasMafia);
                io.to(currentGame.id).emit("getRoles");
                setTimeout(() => {
                  gameRun(currentGame.id);
                }, 30000);
                //we need to have an on 'votesarein' that changes the front end rendering and lets everyone know who died and if they were mafia, gives a few seconds,then goes back to dark
              }
            })
            .catch(err => console.error(err));
        });
    });
  });
};
