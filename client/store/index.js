import { createStore, combineReducers, applyMiddleware } from "redux";
import { createLogger } from "redux-logger";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import players from "./players";
import game from "./game";
import games from "./games";
import user from "./user";

const reducer = combineReducers({ players, game, games, user });

const middleware = composeWithDevTools(
  applyMiddleware(thunkMiddleware, createLogger({ collapsed: true }))
);
const store = createStore(reducer, middleware);

export default store;
export * from "./players";
export * from "./game";
export * from "./games";
export * from "./user";
