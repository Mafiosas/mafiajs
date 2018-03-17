import axios from "axios";

/* ACTION TYPES */
const GET_GAMES = "GET_GAMES";

/* INITIAL STATE */
const defaultGames = [];

/* ACTION CREATORS */
const getGames = games => ({ type: GET_GAMES, games });

/* THUNK CREATORS */
export const fetchGames = () => dispatch =>
  axios
    .get("/api/game")
    .then(res => dispatch(getGames(res.data)))
    .catch(err => console.log(err));

/* REDUCER */
export default function(state = defaultGames, action) {
  switch (action.type) {
    case GET_GAMES:
      return action.games;
    default:
      return state;
  }
}
