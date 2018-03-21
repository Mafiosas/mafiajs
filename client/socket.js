import io from "socket.io-client";
import store, { addPlayer } from "./store";

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("Connected in the front!");

  // socket.emit(
  //   "joinGame",
  //   window.location.pathname.slice(
  //     window.location.pathname.lastIndexOf("/") + 1
  //   )
  // );

  //on game start submit:
  //change peoples state/page to role assignment - back end request to players DB ...how do we stagger the getData and the gameStart?
  // let gameId = window.location.pathname.slice(1);
  // socket.emit("gameStart", gameId);

  // socket.on("getRoles", () => {
  //   //trigger function in store to get specific user's role from database and set it on state
  //   socket.emit("rolesAssigned");
  // });

  socket.on("playerJoined", playerObj => {
    console.log("testing player joined on client side");
    console.log("this socket id is:", socket.id);
    store.dispatch(addPlayer(playerObj));
  });

  socket.on("darkOver", () => {
    //dark data from users (who mafia kill/doctor save etc)
    socket.broadcast.emit("darkData", darkData);
  });

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
