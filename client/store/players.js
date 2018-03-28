import axios from "axios";

/* ACTION TYPES */
const GET_PLAYERS = "GET_PLAYERS";
const ADD_PLAYER = "ADD_PLAYER";
const REMOVE_PLAYER = "REMOVE_PLAYER";

/* INITIAL STATE */
const defaultPlayers = [];

/* ACTION CREATORS */
const getPlayers = players => ({ type: GET_PLAYERS, players });
export const addPlayer = player => ({ type: ADD_PLAYER, player });
export const removePlayer = player => ({ type: REMOVE_PLAYER, player });

/* THUNK CREATORS */
export const getPlayersInGame = id => dispatch =>
  axios
    .get(`/api/players/${id}`) //queries the database for a list of the players
    .then(res => dispatch(getPlayers(res.data)))
    .catch(err => console.log(err));

/* REDUCER */
export default function(state = defaultPlayers, action) {
  switch (action.type) {
    case GET_PLAYERS:
      return action.players;
    case ADD_PLAYER:
      return [...state, action.player];
    case REMOVE_PLAYER:
      return state.filter(el => el.id !== action.player);
    default:
      return state;
  }
}
