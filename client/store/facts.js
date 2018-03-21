import axios from "axios";

//action types
const GET_FACTS = "GET_FACTS";

//Initial State
const defaultState = [];

//action creators
const getFacts = facts => ({ type: GET_FACTS, facts });

//thunk creators
export const fetchFacts = () => {
  return dispatch => {
    axios
      .get("/api/facts")
      .then(res => dispatch(getFacts(res.data)))
      .catch(err => console.log(err));
  };
};

//reducer
export default function(state = defaultState, action) {
  switch (action.type) {
    case GET_FACTS:
      return action.facts;
    default:
      return state;
  }
}
