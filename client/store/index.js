import { createStore, combineReducers, applyMiddleware } from "redux";
import { createLogger } from "redux-logger";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import players from "./players";
import game from "./game";
import games from "./games";
import user from "./user";
import facts from "./facts";
import deaths from "./deaths";
import votes from "./votes";

const reducer = combineReducers({
  players,
  game,
  games,
  user,
  facts,
  deaths,
  votes
});

const middleware = composeWithDevTools(
  applyMiddleware(thunkMiddleware, createLogger({ collapsed: true }))
);
const store = createStore(reducer, middleware);

export default store;
export * from "./players";
export * from "./game";
export * from "./games";
export * from "./user";
export * from "./facts";
export * from "./deaths";
export * from "./votes";
