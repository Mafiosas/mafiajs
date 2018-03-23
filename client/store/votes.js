import axios from "axios";

/* ACTION TYPES */
const ADD_VOTE = "ADD_VOTE";
const GET_VOTES = "GET_VOTES";

/* INITIAL STATE */
const defaultVotes = [];

/* ACTION CREATORS */
export const getVotes = votes => ({ type: GET_VOTES, votes });
export const addVote = vote => ({ type: ADD_VOTE, vote });

/* REDUCER */
export default function(state = defaultVotes, action) {
  switch (action.type) {
    case GET_VOTES:
      return action.votes;
    case ADD_VOTE:
      return [...state, action.vote];
    default:
      return state;
  }
}
