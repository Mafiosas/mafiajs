const Router = require('express').Router();
const Player = require('../db/models');
const Round = require('../db/models');
const { Op } = require('sequelize');

Router.get('/getInitialData', (req, res, next) => {
  const gameId = req.params.gameId
  Player.findOne({
    where: {
      cookieId: req.body.cookieId
    }
  })
  .then(player => {
    if (player.isMafia){
      Player.findAll({
        where: {
          gameId : gameId,
          role : 'Mafia'
        }
      })
      .then(mafiaMembers => {
        player.mafiaMembers = mafiaMembers
        res.json(player)
      })
    }
    else {
      res.json(player)
    }
  })
})

Router.get('/getRoundData', (req, res, next) => {
  const gameId = req.params.gameId
  Round.findOne({
    where: {
      gameId: gameId,
      isCurrent: true
    }
  })
  .then(round => res.json(round))
})

Router.get('/getAllPlayers', (req, res, next) => {
  const gameId = req.params.gameId
  Player.findAll({
    attributes: ['name'],
    where: {
      gameId: gameId
    }
  })
  .then(users => res.json(users))
})


Router.get('/whoWon', (req, res, next) => {
  let alivePlayers, aliveMafias;
  const gameId = req.params.gameId

  Player.findAll({
    where: {
      gameId: gameId,
      role: 'Mafia',
      isAlive: true
    }
  })
  .then(mafias => aliveMafias = mafias.length)

  Player.findAll({
    where: {
      gameId: gameId,
      isAlive: true,
      role: {
        [Op.ne]:'Mafia'
      }
    }
  })
  .then(players => alivePlayers = players.length)


  if(hasGameEnded(aliveMafias, alivePlayers)){
    if(didMafiaWin(aliveMafias)){
      res.json('Mafia won')
    }
    else{
      res.json('Villagers won')
    }
  }
  else {
    //game continues, emit socket
  }
})


Router.post('/newRound', (req, res, next) => {
  Round.create()
  .then(round => round.setGame(req.params.gameId))
  .then(currentRound => res.json(currentRound))
})

Router.put('/newRound', (req, res, next) => {
  //if check to see if it's a mafia making the request, if so:
  let killed = req.body.killed || null;
  //if check to see if it's a doctor making the request, if so:
  let saved = req.body.saved || null;
  let died;
  const gameId = req.params.gameId
    Round.findOne({
      where: {
        gameId: gameId,
        isCurrent: true
      }
    })
    .then(round => {
      if(killed && !round.saved){
        round.update({killed: killed})
      }
      else if (saved && !round.killed){
        round.update({saved: saved})
      }
      else if (saved && round.killed) {
        died = whoDies(round.killed, saved)
        round.update({
          saved: saved,
          died: died
        })
        .then(round => {
          if (round.died !== 'none'){
            Player.update({
              isAlive: false
            },
            {
              where: {
                gameId: gameId,
                name: round.died
              }
            })
          }
        })
        .then(() => {
//          socket.emit('updateData')
        })
      }
      else if (killed && round.saved){
        died = whoDies(killed, round.saved)
        round.update({
          killed: killed,
          died: died
        })
        .then(() => {
//        socket.emit('updateData')
        })
      }
    })
  })

  // else if (saved){
  //   Round.findOne({
  //     // attributes: ['saved'],
  //     where: {
  //       gameId: gameId,
  //       isCurrent: true
  //     }
  //   })
  //   .then(round => {
  //     if(!round.killed){
  //       round.update({saved: saved})
  //     }
  //     else {
  //       //calculate stuff and emit the update data socket
  //     }
  //   })
  // }


  // if (killed === saved){
  //   let died = 'none';
  // }
  // else {
  //   let died = killed;
  // }
  // const gameId = req.params.gameId

  // Round.findOne({
  //   where: {
  //     gameId: gameId,
  //     isCurrent: true
  //   }
  // })
  // .then(round => round.update({
  //   killed,
  //   saved,
  //   died
  // }))
