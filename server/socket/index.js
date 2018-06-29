const { Game, Round, Player } = require('../db/models');
const { whoToSendBack, shuffle, assignRoles } = require('../game.js');
const axios = require('axios');

module.exports = io => {
  const clients = {};
  io.on('connection', socket => {
    console.log(
      `A socket connection to the server has been made: ${socket.id}`
    );

    let game;

    socket.on('joinGame', ({ name, id, gameId }) => {
      game = gameId;
      socket.join(game);
      socket.userName = name;
      clients[id] = socket.id;
      socket.broadcast.to(game).emit('playerJoined', {
        name,
        id
      });
    });
    socket.on('addGameToServer', createdGame => {
      socket.broadcast.emit('newGameAdded', createdGame);
    });

    socket.on('disconnect', () => {
      console.log(`Connection ${socket.id} is no longer connected!`);
    });

    //gameRun is called within gameStart and dayTime votes - the two places at which we want to move to 'dark'
    //two different time points for 'dark-over', one for villagers, to get the doctor 'saved' vote, BEFORE, we calculate the Mafia 'killed vote.
    function gameRun(gameId) {
      io.to(gameId).emit('dark');
      io.to(gameId).emit('owl');
      setTimeout(() => {
        io.to(gameId).emit('darkOverForVillagers');
      }, 25000);
      setTimeout(() => {
        io.to(gameId).emit('darkOverForMafia');
      }, 30000);
    }

    //this is emitted from the front when the creator of the room clicks being game.
    socket.on('gameStart', gameId => {
      Game.findById(gameId, { include: [Player] })
        .then(game => {
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
              players.pop(); //pop off newRound
              players.forEach(player => {
                if (clients[player.id]) {
                  io.to(clients[player.id]).emit('role', player.role);
                }
              });
              gameRun(gameId);
            });
        })
        .catch(err => console.log(err));
    });

    socket.on('villagerChoice', data => {
      const { gameId, saved, guess } = data;
      if (guess) {
        Player.findById(guess)
          .then(foundPlayer => {
            io.to(socket.id).emit(
              //check if detective choice was the mafia, send back true/false. front end tells the detective the result.
              'DetectiveChoice',
              foundPlayer.isMafia()
            );
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

    socket.on('darkData', darkData => {
      //this holds from mafia who they killed
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
        let actualSaved = round.saved;
        let person = whoToSendBack(killed, actualSaved);
        //check to see if person who was saved was also the person who was killed
        const whoDied = person.saved ? null : person.killed;
        const roundUpdate = {
          died: whoDied,
          killed,
          isCurrent: false
        };
        //if someone did die..
        let proms = [round.update(roundUpdate)];
        if (whoDied) {
          proms.push(
            Player.update(
              {
                isAlive: false,
                role: 'Dead'
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
        return Promise.all(proms)
          .then(resolved => {
            if (resolved[1]) {
              //the game, is it over?
              return resolved[1][1][0].checkGameStatus();
            }
          })
          .then(() => {
            return Game.findById(gameId);
          })
          .then(updatedGame => {
            if (updatedGame.winner) {
              io.to(gameId).emit('gameOver', updatedGame.winner);
            } else {
              return Round.create({
                gameId: gameId,
                isCurrent: true
              }).then(round => {
                if (round) {
                  io.to(gameId).emit('daytime', person);
                  io.to(gameId).emit('rooster');
                }
              });
            }
          })
          .catch(err => console.error(err));
      });
    });

    //this is to have show the votes as they come in
    socket.on('myVote', voteData => {
      io.to(game).emit('myVote', voteData);
    });

    socket.on('daytimeVotes', votes => {
      //multiple promises pushed to the promise array, for a Promise.all later
      let promsArray = [];
      io.to(game).emit('resetVotes');
      let countedVotes = {};

      for (let key in votes) {
        if (!countedVotes[votes[key]]) countedVotes[votes[key]] = 1;
        else countedVotes[votes[key]]++;
      }
      //find who had the most votes
      const votedOutId = Object.keys(countedVotes).reduce(
        (a, b) => (countedVotes[a] > countedVotes[b] ? a : b)
      );
      let wasMafia;
      //find if the person who was voted for was lead mafia, if so make another mafia the lead
      Player.findById(+votedOutId)
        .then(foundPlayer => {
          if (foundPlayer.role === 'Lead Mafia') {
            promsArray.push(Player.changeLeadMafia(foundPlayer.gameId));
          }
          if (
            foundPlayer.role === 'Mafia' ||
            foundPlayer.role === 'Lead Mafia'
          ) {
            wasMafia = true;
          } else {
            wasMafia = false;
          }
          promsArray.push(foundPlayer.update({ role: 'Dead' }));
          return Promise.all(promsArray)
            .then(() => {
              //check did that person dieing end the game??
              return foundPlayer.checkGameStatus();
            })
            .then(foundGame => {
              if (foundGame.winner) {
                io.to(foundGame.id).emit('gameOver', foundGame.winner);
              } else {
                io.to(foundGame.id).emit(
                  'votesData',
                  foundPlayer.name,
                  !!wasMafia
                );
                //ask them to get their roles again to find out if they died.
                io.to(foundGame.id).emit('getRoles');
                setTimeout(() => {
                  //go to dark again!
                  gameRun(foundGame.id);
                }, 30000);
              }
            });
        })
        .catch(err => console.error(err));
    });
  });
};
