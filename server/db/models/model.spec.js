const { expect } = require("chai");
const db = require("../index");
const { Death, Game, Player, Round } = require("./index");
const { Op } = require("sequelize");

describe("Player model", () => {
  let allUsers, currentGame;
  beforeEach(() => {
    return db
      .sync({ force: true })
      .then(() => {
        return Game.create({
          name: "Test game"
        });
      })
      .then(game => {
        currentGame = game;
        return Player.bulkCreate([
          {
            cookieId: 1,
            role: "Mafia",
            name: "Noor",
            gameId: game.id
          },
          {
            cookieId: 2,
            role: "Civilian",
            name: "Ella",
            gameId: game.id
          },
          {
            cookieId: 3,
            role: "Mafia",
            name: "John",
            gameId: game.id
          },
          {
            cookieId: 4,
            role: "Doctor",
            name: "Emily",
            gameId: game.id
          },
          {
            cookieId: 5,
            role: "Civilian",
            name: "Eleni",
            gameId: game.id
          },
          {
            cookieId: 6,
            role: "Detective",
            name: "Leigh",
            gameId: game.id
          }
        ])
          .then(() => Player.findAll())
          .then(players => (allUsers = players));
      });
  });
  describe("Player attributes", () => {
    console.log(allUsers);
    it("defaults to is Alive is true", () => {
      expect(allUsers[0].isAlive).to.be.equal(true);
    });

    it("isMafia hook returns true when mafia", () => {
      expect(allUsers[0].isMafia).to.be.equal(true);
    });
  });
  describe("game defaults to in progress/not over", () => {
    it("Game hasEnded returns false by default", () => {
      expect(currentGame.hasEnded).to.be.equal(false);
    });
  });
  describe("simulating one round where Mafia loses", () => {
    before(() => {
      Player.update(
        {
          isAlive: false
        },
        {
          where: {
            role: "Mafia"
          }
        }
      );
    });
    it("Ensures after update hook runs and ends game properly", () => {
      expect(currentGame.hasEnded).to.be.equal(true);
    });
    it("Winner should be villagers", () => {
      expect(currentGame.winner).to.be.equal("Villagers");
    });
  });
  describe("simulating one round where Mafia wins", () => {
    before(() => {
      Player.update(
        {
          isAlive: false
        },
        {
          where: {
            [Op.ne]: "Mafia"
          }
        }
      );
    });
    it("Ensures after update hook runs and ends game properly", () => {
      expect(currentGame.hasEnded).to.be.equal(true);
    });
    it("Winner should be mafia", () => {
      expect(currentGame.winner).to.be.equal("Mafia");
    });
  });
});
