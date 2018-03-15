//as players join the room they are pushed to playersArray = []

//fisher yates shuffle:
function shuffle(playersArray) {
  let counter = array.length;

  while (counter > 0) {
    let index = Math.floor(Math.random() * counter);

    counter--;

    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

function assignRoles(shuffled) {
  let result = {};

  const totalMafia = Math.floor(shuffled.length / 2 - 1);

  //arrays of players
  const maf = shuffled.splice(0, totalMafia);
  const det = [shuffled.pop()];
  const doc = [shuffled.pop()];
  const civ = shuffled;

  result[mafia] = maf;
  result[detective] = det;
  result[doctor] = doc;
  result[civilian] = civ;

  return result;
}

//roles.mafia = []

function hasGameEnded(mafias, villagers){
  if (mafias === 0 || mafias === villagers){
    return true;
  }
  else {
    return false;
  }
}

function didMafiaWin(mafias){
  if(mafias === 0){
    return false;
  }
  else {
    return true;
  }
}

function whoDies(killed, saved){
  killed === saved ? 'none' : killed;
}
