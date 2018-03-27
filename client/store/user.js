import axios from "axios";
import { addPlayer } from "./players";
import socket from "../socket";
import { getPlayersInGame } from "./players";

//ACTION TYPE
const SET_USER = "SET_USER";
const UPDATE_USER = "UPDATE_USER";

//INITIAL STATE
const defaultUser = {};

//ACTION CREATOR
const setUser = user => ({ type: SET_USER, user });
export const updateUser = updateData => ({ type: UPDATE_USER, updateData });

//THUNK CREATORS
export const getMe = gameId => {
  return dispatch => {
    axios
      .get("/api/players/me")
      .then(res => {
        dispatch(setUser(res.data));
        dispatch(getPlayersInGame(gameId));
      })
      .catch(err => console.error(err));
  };
};

export const getOnlyMe = gameId => {
  return dispatch => {
    axios
      .get("/api/players/me")
      .then(res => {
        dispatch(setUser(res.data));
      })
      .catch(err => console.error(err));
  };
};

export const joinExistingGame = (gameId, name, history) => dispatch => {
  axios
    .post(`/api/players`, { gameId, name }) // back route needs to post to Player and associate the gameId
    .then(res => {
      dispatch(setUser(res.data));
      dispatch(
        addPlayer({
          id: res.data.id,
          name: res.data.name
        })
      );
      socket.emit("joinGame", {
        id: res.data.id,
        name: res.data.name,
        gameId
      });

      history.push(`/game/${gameId}`);
    })
    .catch(err => console.log(err));
};

//REDUCER
export default function(state = defaultUser, action) {
  switch (action.type) {
    case SET_USER:
      return action.user;
    case UPDATE_USER:
      return Object.assign({}, state, action.updateData);
    default:
      return state;
  }
}
