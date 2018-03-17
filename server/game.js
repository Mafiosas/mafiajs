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
  let result = {};

  const totalMafia = Math.floor(shuffled.length / 2 - 1);

  //arrays of players
  const maf = shuffled.splice(0, totalMafia);
  const det = [shuffled.pop()];
  const doc = [shuffled.pop()];
  const civ = shuffled;

  result["mafia"] = maf;
  result["detective"] = det;
  result["doctor"] = doc;
  result["civilian"] = civ;

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
  whoToSendBack
};
