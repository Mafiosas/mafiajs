import axios from "axios";

/* ACTION TYPES */
const ADD_VOTE = "ADD_VOTE";
const GET_VOTES = "GET_VOTES";
const RESET_VOTES = "RESET_VOTES";

/* INITIAL STATE */
const defaultVotes = {};

/* ACTION CREATORS */
export const getVotes = votes => ({ type: GET_VOTES, votes });
export const addVote = vote => ({ type: ADD_VOTE, vote });
export const resetVotes = () => ({ type: RESET_VOTES, votes: {} });

/* REDUCER */
export default function(state = defaultVotes, action) {
  switch (action.type) {
    case GET_VOTES:
      return state;
    case ADD_VOTE:
      const newState = Object.assign({}, state);
      newState[action.vote.whoVoted] = action.vote.whoFor;
      return newState;
    case RESET_VOTES:
      return action.votes;
    default:
      return state;
  }
}

// {
//   whoVoted: 3,
//   whoFor: 2
// }
