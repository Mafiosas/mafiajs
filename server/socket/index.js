const { Game, Round, Player } = require("../db/models");
const { whoToSendBack, shuffle, assignRoles } = require("../game.js");

module.exports = io => {
  io.on("connection", socket => {
    console.log(
      `A socket connection to the server has been made: ${socket.id}`
    );

    let game;

    socket.on("joinGame", gameId => {
      game = gameId;
      console.log("this is game", game, gameId);
      socket.join(game);
    });

    socket.on("disconnect", () => {
      console.log(`Connection ${socket.id} is no longer connected!`);
    });

    socket.on("gameStart", async gameId => {
      const players = await Player.findAll({
        where: {
          gameId: gameId
        },
        attributes: ["name"]
      });
      const nameArray = players.map(el => el.name);

      let shuffledPlayers = assignRoles(shuffle(nameArray));
      let promsArray = [];
      for (let i = 0; i < shuffledPlayers.length; i++) {
        console.log(shuffledPlayers[i].name, shuffledPlayers[i].role);
        promsArray.push(
          Player.update(
            {
              role: shuffledPlayers[i].role
            },
            {
              where: {
                name: shuffledPlayers[i].name
              }
            }
          )
        );
      }
      Promise.all(promsArray)
        .then(() => socket.broadcast.to(game).emit("getRoles"))
        .catch(err => console.err);
      //shuffle works, we sitll need to assign roles
    });

    socket.on("rolesAssigned", () => {
      socket.broadcast.to(game).emit("dark", () => {
        setTimeout(() => {
          socket.broadcast.to(game).emit("darkOver");
        }, 60000);
      });
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
        socket.broadcast.to(game).emit("darkOver");
      }, 6000);
    });
  });
};
