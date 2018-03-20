import axios from "axios";

/* ACTION TYPES */
const GET_PLAYERS = "GET_PLAYERS";

/* INITIAL STATE */
const defaultPlayers = [];

/* ACTION CREATORS */
const getPlayers = players => ({ type: GET_PLAYERS, players });

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
    default:
      return state;
  }
}
