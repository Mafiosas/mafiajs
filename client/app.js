import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Home from "./components/Home.jsx";
import GameRoom from "./components/GameRoom.jsx";

export default class App extends Component {
  render() {
    return (
      <div>
        <Router>
          <Route exact path="/" component={Home} />
          <Route path="/game/:roomName" component={GameRoom} />
        </Router>
      </div>
    );
  }
}
