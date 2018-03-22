import React, { Component } from "react";
import socket from "../socket";

export default class DayTimeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: ""
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    console.log("day time component has mounted");

    socket.on("getVotes", () => {
      console.log("sending back our vote", this.state.selected);
      socket.emit("voteData", this.state.selected);
    });
  }

  handleChange(event) {
    this.setState({ selected: event.target.value });
  }

  render() {
    const { players } = this.props;
    console.log("players inside form", players);
    console.log("selected", this.state.selected);

    return (
      <div>
        <form>
          <label>Who do you think is Mafia?</label>
          <select
            onChange={this.handleChange}
            className="browser-default"
            name="selectPlayers"
          >
            <option>Select a player</option>
            {players.length &&
              players.map(player => {
                return (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                );
              })}
          </select>
        </form>
      </div>
    );
  }
}
