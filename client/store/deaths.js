import axios from "axios";

//action types
const GET_DEATHS = "GET_DEATHS";

//initial state
const defaultState = [];

//action creators
const getDeaths = deaths => ({ type: GET_DEATHS, deaths });

//thunk creators
export const fetchDeaths = () => {
  return dispatch => {
    axios
      .get("/api/deaths")
      .then(res => dispatch(getDeaths(res.data)))
      .catch(err => console.error(err));
  };
};

//reducer
export default function(state = defaultState, action) {
  switch (action.type) {
    case GET_DEATHS:
      return action.facts;
    default:
      return state;
  }
}
