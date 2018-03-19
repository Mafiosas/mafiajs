import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Home from "./components/Home.jsx";
import RoomForm from "./components/RoomForm";
import GameRoom from "./components/GameRoom";

export default class App extends Component {
  render() {
    return (
      <div>
        <Router>
          <Route exact path="/" component={Home} />
          <Route path="/createGame" component={RoomForm} />
          <Route path="/game/:gameId" component={GameRoom} />
        </Router>
      </div>
    );
  }
}
