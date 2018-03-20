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

function assignRoles(shuffled) {
  let result = [];

  const totalMafia = Math.floor(shuffled.length / 2 - 1);

  //arrays of players
  for (i = 0; i < totalMafia; i++) {
    result.push({
      name: shuffled[i],
      role: "Mafia"
    });
  }
  result.push({
    name: shuffled[totalMafia],
    role: "Detective"
  });
  result.push({
    name: shuffled[totalMafia + 1],
    role: "Doctor"
  });
  for (let j = totalMafia + 2; j < shuffled.length; j++) {
    result.push({
      name: shuffled[j],
      role: "Civilian"
    });
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

function didMafiaWin(mafias) {
  if (mafias.length === 0) {
    return false;
  } else {
    return true;
  }
}

function whoToSendBack(killed, saved) {
  return killed === saved
    ? {
        saved: saved
      }
    : {
        killed: killed
      };
}

module.exports = {
  hasGameEnded,
  didMafiaWin,
  whoToSendBack,
  shuffle,
  assignRoles
};
