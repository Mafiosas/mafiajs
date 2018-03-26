import axios from "axios";

/* ACTION TYPES */
const GET_GAMES = "GET_GAMES";
const ADD_GAME = "ADD_GAME";

/* INITIAL STATE */
const defaultGames = [];

/* ACTION CREATORS */
const getGames = games => ({ type: GET_GAMES, games });
export const addGame = game => ({ type: ADD_GAME, game });

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
    case ADD_GAME:
      return [...state, action.game];
    default:
      return state;
  }
}
