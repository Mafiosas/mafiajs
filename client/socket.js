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
});

export default socket;
