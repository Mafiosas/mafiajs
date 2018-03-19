import axios from "axios";

//ACTION TYPE
const GET_USER = "GET_USER";

//INITIAL STATE
const defaultUser = {};

//ACTION CREATOR
const getUser = user => ({ type: GET_USER, user });

//THUNK CREATORS
export const user = playerId => {
  dispatch =>
    axios
      .get(`api/players/${playerId}`)
      .then(res => dispatch(getUser(res.data)))
      .catch(err => console);
};

export const joinExistingGame = (gameId, name) => dispatch => {
  axios
    .post(`/api/players`, { gameId, name }) // back route needs to post to Player and associate the gameId
    .then(res => dispatch(getUser(res.data)))
    .catch(err => console.log(err));
};

//REDUCER
export default function(state = defaultUser, action) {
  switch (action.type) {
    case GET_USER:
      return action.user;
    default:
      return state;
  }
}
