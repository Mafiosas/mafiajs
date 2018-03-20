import axios from "axios";

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
  console.log("id", id);
  return dispatch => {
    axios
      .get(`/api/game/${id}`)
      .then(res => dispatch(getGame(res.data)))
      .catch(err => console.log(err));
  };
};

export const addNewGame = (roomName, password, name, history) => dispatch => {
  axios
    .post("/api/game/new", { roomName, password, name })
    .then(res => res.data)
    .then(game => {
      dispatch(createGame(game));
      history.push(`/game/${game.id}`);
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
