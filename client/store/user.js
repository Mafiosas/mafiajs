import axios from "axios";

//ACTION TYPE
const GET_USER = "GET_USER";

//INITIAL STATE
const defaultUser = {};

//ACTION CREATOR
const getUser = user => ({ type: GET_USER, user });

//THUNK CREATORS
export const user = () => {
  dispatch =>
    axios
      .get("api/players/:playerId")
      .then(res => dispatch(getUser(res.data)))
      .catch(err => console);
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
