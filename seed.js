const { Death, Game, Player, Round, Fact } = require("./server/db/models");
const db = require("./server/db/db");

const deaths = [
  {
    storyForAll:
      "should've gone for the caramel macchiato because the skinny latte was poisoned",
    storyForKilled:
      "should've gone for the caramel macchiato because the skinny latte was poisoned"
  },
  {
    storyForAll:
      "was found on the kitchen floor, covered in blood and chocolate cake",
    storyForKilled:
      "were found on the kitchen floor, covered in blood and chocolate cake"
  },
  {
    storyForAll:
      "was last seen ordering a coffee, but never came to pick it up",
    storyForKilled:
      "were last seen ordering a coffee, but never came to pick it up"
  },
  {
    storyForAll:
      "went into the salon for a simple hair cut but came out with her head cut off",
    storyForKilled:
      "went into the salon for a simple hair cut but came out with your head cut off"
  }
];

const mafiaFacts = [
  {
    fact:
      "A government analysis estimated that, in the 1960s, the illicit profit of the nation's twenty-odd mob families topped $7 billion annually, approximately the combined earnings of the ten largest industrial corporations in the country."
  },
  {
    fact:
      "The Sicilian word omerta, Cosa Nostra's strict code of silence, essentially means ‘men of honor.' Omerta is a way of life and a code of conduct. Along with the vow of silence in dealing with law enforcement, omerta ensures that members of the American mafia swear total devotion to the head of their family."
  },
  {
    fact:
      "Joe Pistone, the undercover FBI Agent known as Donnie Brasco, was an FBI agent for 27 years. He spent about 20 of those years as an undercover agent. When Donnie Brasco's true identity as FBI undercover agent Joe Pistone was revealed, The Bonanno crime family lost its seat on The Commission and a $500,000 open contract was placed on Pistone's head."
  },
  {
    fact:
      "John 'Sonny' Franzese told mafia informant Guy Fatato, 'I killed a lot of guys...you`re not talking about four, five, six, ten.' Franzese instructed Fatano to wear hairnets when disposing of evidence, and said getting rid of a body could be done by 'dismembering the corpse in a kiddie pool and drying the severed body parts in a microwave before stuffing the parts in a commercial-grade garbage disposal.'"
  },
  {
    fact:
      "The alleged requirements to become 'made' – fully initiated – in a La Cosa Nostra family are that you're a full-blooded Italian on both sides – specifically Sicilian, if they're being strict - that you're sponsored by made members of that family, and that you commit a murder for the family. This is called 'making your bones.' The only other way to become made is through being an 'earner' – making large amounts of money for the family"
  },
  {
    fact:
      "Former Mafia associate Sal Polisi always used a white, plastic 'I LOVE NEW YORK' bag for his bank robberies."
  }
];

// const games = [
//   {
//     //game has not started yet, still waiting for players to join room
//     id: 1,
//     roomName: "mafiosas",
//     password: "mafia123",
//     numPlayers: 6,
//     winner: null,
//     inProgress: false,
//     sessionId: ""
//   },
//   {
//     //game has started, finished round 1
//     id: 2,
//     roomName: "theOGmafia",
//     password: "gangsta",
//     numPlayers: 6,
//     winner: null,
//     inProgress: true,
//     sessionId: ""
//   },
//   {
//     //game has ended, winner is Joey
//     id: 3,
//     roomName: "friends",
//     password: "chanandlerbong",
//     numPlayers: 6,
//     winner: "Mafia",
//     inProgress: false,
//     sessionId: ""
//   }
// ];

// const players = [
//   {
//     gameId: 1,
//     name: "Dani"
//   },
//   {
//     gameId: 1,
//     name: "Brittany"
//   },
//   {
//     gameId: 1,
//     name: "Gabby"
//   },
//   {
//     gameId: 2,
//     name: "Noor",
//     role: "Mafia"
//   },
//   {
//     gameId: 2,
//     name: "John",
//     role: "Mafia"
//   },
//   {
//     gameId: 2,
//     name: "Ella",
//     role: "Civilian",
//     isAlive: false
//   },
//   {
//     gameId: 2,
//     name: "Emily",
//     role: "Doctor"
//   },
//   {
//     gameId: 2,
//     name: "Eleni",
//     role: "Civilian"
//   },
//   {
//     gameId: 2,
//     name: "Leigh",
//     role: "Detective"
//   },
//   {
//     gameId: 3,
//     name: "Rachel",
//     role: "Civilian"
//   },
//   {
//     gameId: 3,
//     name: "Monica",
//     role: "Mafia"
//   },
//   {
//     gameId: 3,
//     name: "Phoebe",
//     role: "Mafia"
//   },
//   {
//     gameId: 3,
//     name: "Joey",
//     role: "Civilian"
//   },
//   {
//     gameId: 3,
//     name: "Chandler",
//     role: "Doctor"
//   },
//   {
//     gameId: 3,
//     name: "Ross",
//     role: "Detective"
//   }
// ];

// const rounds = [
//   {
//     gameId: 2,
//     number: 1,
//     isCurrent: false,
//     killed: "Ella",
//     saved: "Leigh",
//     died: "Ella"
//   }
// ];

function buildingDeaths() {
  return Promise.all(deaths.map(death => Death.create(death)));
}

// function buildingGames() {
//   return Promise.all(games.map(game => Game.create(game)));
// }

// function buildingPlayers() {
//   return Promise.all(players.map(player => Player.create(player)));
// }

// function buildingRounds() {
//   return Promise.all(rounds.map(round => Round.create(round)));
// }

function buildingMafiaFacts() {
  return Promise.all(mafiaFacts.map(fact => Fact.create(fact)));
}

function seed() {
  return (
    buildingDeaths()
      // .then(() => buildingGames())
      // .then(() => buildingPlayers())
      // .then(() => buildingRounds())
      .then(() => buildingMafiaFacts())
  );
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
