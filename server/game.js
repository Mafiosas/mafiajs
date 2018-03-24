//as players join the room they are pushed to playersArray = []

//fisher yates shuffle:
function shuffle(playersArray) {
  let counter = playersArray.length;

  while (counter > 0) {
    let index = Math.floor(Math.random() * counter);

    counter--;

    let temp = playersArray[counter];
    playersArray[counter] = playersArray[index];
    playersArray[index] = temp;
  }

  return playersArray;
}

function assignRoles(shuffledIdArray) {
  let result = {};

  const totalMafia = Math.floor(shuffledIdArray.length / 2 - 1);

  //arrays of players
  for (let i = 0; i < totalMafia - 1; i++) {
    result[shuffledIdArray[i]] = {
      role: "Mafia"
    };
  }
  result[shuffledIdArray[totalMafia - 1]] = {
    role: "Lead Mafia"
  };
  result[shuffledIdArray[totalMafia]] = {
    role: "Detective"
  };
  result[shuffledIdArray[totalMafia + 1]] = {
    role: "Doctor"
  };
  for (let j = totalMafia + 2; j < shuffledIdArray.length; j++) {
    result[shuffledIdArray[j]] = {
      role: "Civilian"
    };
  }

  return result;
}

//roles.mafia = []

function hasGameEnded(mafias, villagers) {
  if (mafias.length === 0 || mafias.length === villagers.length) {
    return true;
  } else {
    return false;
  }
}

function whoToSendBack(killed, saved) {
  console.log("inside who to send back, killed", killed, " and saved ", saved);
  return killed == saved
    ? {
        saved: saved
      }
    : {
        killed: killed
      };
}

module.exports = {
  hasGameEnded,
  whoToSendBack,
  shuffle,
  assignRoles
};
