import io from "socket.io-client";
import store, { addPlayer } from "./store";

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("Connected in the front!");

  socket.on("playerJoined", playerObj => {
    console.log("this socket id is:", socket.id);
    store.dispatch(addPlayer(playerObj));
  });

  socket.on("daytime", dataFromDark => {
    socket.emit("startDayTimerPreVotes");
  });

  socket.on("getVotes", () => {
    socket.broadcast.emit("voteData", voteData);
  });

  socket.on("dayVoteResults", dayVoteResults => {
    //tell them the results
    //this gets the string name of someone
    socket.emit("startDayTimerPostVotes");
  });

  socket.on("gameOver", winners => {
    //change state to game over which changes page
    //winners will either be Villagers or Mafia
  });
  socket.on("role", payload => {
    console.log("we got assigned!", payload);
  });
});

export default socket;
