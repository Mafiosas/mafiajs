import axios from "axios";
import { addPlayer } from "./players";
import { addGame } from "./games";
import socket from "../socket";

/* ACTION TYPES */
const GET_GAME = "GET_GAME";
const JOIN_GAME = "JOIN_GAME";
const CREATE_GAME = "CREATE_GAME";

/* INITIAL STATE */
const defaultGame = {};

/* ACTION CREATORS */
const getGame = game => ({ type: GET_GAME, game });
const createGame = game => ({ type: CREATE_GAME, game });

/* THUNK CREATORS */
export const fetchGame = id => {
  return dispatch => {
    axios
      .get(`/api/game/${id}`)
      .then(res => dispatch(getGame(res.data)))
      .catch(err => console.log(err));
  };
};

export const addNewGame = (
  roomName,
  password,
  name,
  numPlayers,
  history
) => dispatch => {
  axios
    .post("/api/game/new", { roomName, password, name, numPlayers })
    .then(res => {
      return res.data;
    })
    .then(({ createdGame, newPlayer }) => {
      socket.emit("joinGame", {
        id: newPlayer.id,
        name: newPlayer.name,
        gameId: createdGame.id
      });

      socket.emit("addGameToServer", createdGame);

      dispatch(createGame(createdGame));
      dispatch(addPlayer(newPlayer));
      dispatch(addGame(createdGame));
      history.push(`/game/${createdGame.id}`);
    })

    .catch(err => console.log(err));
};

/* REDUCER */
export default function(state = defaultGame, action) {
  switch (action.type) {
    case GET_GAME:
      return action.game;
    case CREATE_GAME:
      return action.game;
    default:
      return state;
  }
}
