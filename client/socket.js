import io from "socket.io-client";

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("Connected!");

  socket.emit("joinGame", window.location.pathname);

  //on game start submit:
  //change peoples state/page to role assignment - back end request to players DB ...how do we stagger the getData and the gameStart?
  socket.emit("gameStart");

  socket.on("darkOver", () => {
    //dark data from users (who mafia kill/doctor save etc)
    socket.broadcast.emit("darkData", darkData);
  });

  socket.on("daytime", dataFromDark => {
    //change state/view to daytime view;
    //share the data
    socket.emit("startDayTimerPreVotes");
  });

  socket.on("dark", () => {
    //change state/view to dark view
    socket.emit("startDarkTimer");
  });

  socket.on("getVotes", () => {
    //give voteData
    socket.broadcast.emit("voteData", voteData);
  });

  socket.on("dayVoteResults", dayVoteResults => {
    //tell them the results
    socket.emit("startDayTimerPostVotes");
  });

  socket.on("gameOver", () => {
    //change state to game over which changes page
  });
});

export default socket;
