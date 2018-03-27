import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./components/Home.jsx";
import RoomForm from "./components/RoomForm.jsx";
import GameRoom from "./components/GameRoom.jsx";

export default class App extends Component {
  render() {
    return (
      <div>
        <space />
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/createGame" component={RoomForm} />
            <Route path="/game/:gameId" component={GameRoom} />
          </Switch>
        </Router>
      </div>
    );
  }
}
