import io from "socket.io-client";
import store, { addPlayer } from "./store";

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("Connected in the front!");

  socket.on("playerJoined", playerObj => {
    console.log("this socket id is:", socket.id);
    store.dispatch(addPlayer(playerObj));
  });

  // socket.on("darkOver", () => {
  //   //dark data from users (who mafia kill/doctor save etc)
  //   socket.emit("darkData", darkData);
  // });

  socket.on("daytime", dataFromDark => {
    //change state/view to daytime view;
    //data we get back will look like { killed: Name } or { saved: Name }
    //share the data
    socket.emit("startDayTimerPreVotes");
  });

  // socket.on("dark", () => {
  //   //change state/view to dark view
  //   socket.emit("startDarkTimer");
  // });

  socket.on("getVotes", () => {
    //give voteData
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
