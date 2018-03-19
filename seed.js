const { Death, Game, Player, Round } = require("./server/db/models");
const db = require("./server/db/db");

const deaths = [
  {
    story: "ate too much cheese and died from indigestion"
  }
];

const games = [
  {
    //game has not started yet, still waiting for players to join room
    id: 1,
    roomName: "mafiosas",
    password: "mafia123",
    numPlayers: 6,
    winner: null,
    inProgress: false,
    sessionId: ""
  },
  {
    //game has started, finished round 1
    id: 2,
    roomName: "theOGmafia",
    password: "gangsta",
    numPlayers: 6,
    winner: null,
    inProgress: true,
    sessionId: ""
  },
  {
    //game has ended, winner is Joey
    id: 3,
    roomName: "friends",
    password: "chanandlerbong",
    numPlayers: 6,
    winner: "Mafia",
    inProgress: false,
    sessionId: ""
  }
];

const players = [
  {
    gameId: 1,
    name: "Dani"
  },
  {
    gameId: 1,
    name: "Brittany"
  },
  {
    gameId: 1,
    name: "Gabby"
  },
  {
    gameId: 2,
    name: "Noor",
    role: "Mafia"
  },
  {
    gameId: 2,
    name: "John",
    role: "Mafia"
  },
  {
    gameId: 2,
    name: "Ella",
    role: "Civilian",
    isAlive: false
  },
  {
    gameId: 2,
    name: "Emily",
    role: "Doctor"
  },
  {
    gameId: 2,
    name: "Eleni",
    role: "Civilian"
  },
  {
    gameId: 2,
    name: "Leigh",
    role: "Detective"
  },
  {
    gameId: 3,
    name: "Rachel",
    role: "Civilian"
  },
  {
    gameId: 3,
    name: "Monica",
    role: "Mafia"
  },
  {
    gameId: 3,
    name: "Phoebe",
    role: "Mafia"
  },
  {
    gameId: 3,
    name: "Joey",
    role: "Civilian"
  },
  {
    gameId: 3,
    name: "Chandler",
    role: "Doctor"
  },
  {
    gameId: 3,
    name: "Ross",
    role: "Detective"
  }
];

const rounds = [
  {
    gameId: 2,
    number: 1,
    isCurrent: false,
    killed: "Ella",
    saved: "Leigh",
    died: "Ella"
  }
];

function buildingDeaths() {
  return Promise.all(deaths.map(death => Death.create(death)));
}

function buildingGames() {
  return Promise.all(games.map(game => Game.create(game)));
}

function buildingPlayers() {
  return Promise.all(players.map(player => Player.create(player)));
}

function buildingRounds() {
  return Promise.all(rounds.map(round => Round.create(round)));
}

function seed() {
  return buildingDeaths()
    .then(() => buildingGames())
    .then(() => buildingPlayers())
    .then(() => buildingRounds());
}

console.log("Syncing Database baby");

db
  .sync({ force: true })
  .then(() => {
    console.log("Seeding database");
    return seed();
  })
  .then(() => console.log("Seeding Successful"))
  .catch(err => {
    console.error("Error while seeding");
    console.error(err.stack);
  })
  .finally(() => {
    db.close();
    return null;
  });
