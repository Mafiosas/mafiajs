import io from "socket.io-client";
import store, { addPlayer, addGame } from "./store";

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("Connected in the front!");

  socket.on("playerJoined", playerObj => {
    store.dispatch(addPlayer(playerObj));
  });

  socket.on("newGameAdded", game => {
    store.dispatch(addGame(game));
  });

  // socket.on("darkOverForVillagers", () => {
  //   console.log("dark is over for detective");

  //   // this.props.darkOverDetective(this.state.selected);
  //   // this.setState({ selected: "" });
  // });

  // socket.on("daytime", dataFromDark => {
  //   socket.emit("startDayTimerPreVotes");
  // });

  // socket.on("getVotes",  => {
  //   socket.broadcast.emit("voteData", voteData);
  // });

  // socket.on("dayVoteResults", dayVoteResults => {
  //   //tell them the results
  //   //this gets the string name of someone
  //   socket.emit("startDayTimerPostVotes");
  // });

  // socket.on("gameOver", winners => {
  //   //change state to game over which changes page
  //   //winners will either be Villagers or Mafia
  // });
});

export default socket;
