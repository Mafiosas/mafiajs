const { expect } = require('chai');
const db = require('../index');
const { Death, Game, Player, Round } = require('./index');
const { Op } = require('sequelize');

describe('Player model', () => {
  let allUsers, currentGame;
  describe('Player attributes', () => {
    // beforeEach(() => {
    //   return db
    //     .sync({ force: true })
    //     .then(() => {
    //       return Game.create({
    //         name: "Test game"
    //       });
    //     })
    //     .then(game => {
    //       currentGame = game;
    //       return Player.bulkCreate([
    //         {
    //           cookieId: 1,

    //           name: "Gabby",
    //           gameId: currentGame.id
    //         },
    //         {
    //           cookieId: 2,

    //           name: "Dani",
    //           gameId: currentGame.id
    //         },
    //         {
    //           cookieId: 3,

    //           name: "Britt",
    //           gameId: currentGame.id
    //         },
    //         {
    //           cookieId: 4,

    //           name: "John",
    //           gameId: currentGame.id
    //         },
    //         {
    //           name: "Kate",
    //           gameId: currentGame.id,
    //           cookieId: 5
    //         },
    //         {
    //           cookieId: 6,

    //           name: "Noor",
    //           gameId: currentGame.id
    //         }
    //       ])
    //         .then(() => Player.findAll())
    //         .then(players => {
    //           allUsers = players;
    //         });
    //     });
    // });
    it('defaults to is Alive is true', () => {
      expect(allUsers[0].isAlive).to.be.equal(true);
    });

    it('isMafia hook returns true when mafia', () => {
      expect(allUsers[0].isMafia()).to.be.equal(true);
    });
  });
  describe('game defaults to in progress/not over', () => {
    it('Game hasEnded returns false by default', () => {
      expect(currentGame.hasEnded()).to.be.equal(false);
    });
    describe('alive players method', () => {
      it('returns the accurate number of alive players', () => {
        expect(currentGame.alivePlayers()).to.be.equal(6);
      });
    });
  });
  describe('simulating one round where Mafia loses', () => {
    beforeEach(() => {
      allUsers[0].update({
        isAlive: false
      });
      allUsers[2].update({
        isAlive: false
      });
    });
    it('Ensures after update hook runs and ends game properly', () => {
      expect(currentGame.hasEnded).to.be.equal(true);
    });
    it('Winner should be villagers', () => {
      expect(currentGame.dataValues.winner).to.be.equal('Villagers');
    });
  });
});

describe('Game model', () => {});
