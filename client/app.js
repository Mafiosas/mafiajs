import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Home from "./components/Home.jsx";

export default class App extends Component {
  render() {
    return (
      <Router>
        <Route component={Home} />
      </Router>
    );
  }
}
