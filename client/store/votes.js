import axios from "axios";

/* ACTION TYPES */
const ADD_VOTE = "ADD_VOTE";
const GET_VOTES = "GET_VOTES";

/* INITIAL STATE */
const defaultVotes = {};

/* ACTION CREATORS */
export const getVotes = votes => ({ type: GET_VOTES, votes });
export const addVote = vote => ({ type: ADD_VOTE, vote });

/* REDUCER */
export default function(state = defaultVotes, action) {
  switch (action.type) {
    case GET_VOTES:
      return state;
    case ADD_VOTE:
      state[action.vote.whoVoted] = action.vote.whoFor;
      return state;
    default:
      return state;
  }
}

// {
//   whoVoted: 3,
//   whoFor: 2
// }
