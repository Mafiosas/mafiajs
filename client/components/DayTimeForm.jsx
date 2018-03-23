import React, { Component } from "react";
import socket from "../socket";

export default class DayTimeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.submitVote = this.submitVote.bind(this);
  }

  componentDidMount() {
    socket.on("getVotes", () => {
      console.log("sending back our vote", this.state.selected);
      socket.emit("voteData", this.state.selected);
    });
  }

  submitVote(evt) {
    evt.preventDefault();
    let userId = this.props.user;
    let voted = this.props.players.find(player => {
      return player.name === evt.target.value;
    });
    let votedId = voted.id;
    socket.emit("myVote", { whoVoted: userId, whoFor: votedId });
  }

  handleChange(event) {
    this.setState({ selected: event.target.value });
  }

  render() {
    const { players } = this.props;

    return (
      <div>
        <form onSubmit={this.submitVote}>
          <label>Who do you think is Mafia?</label>
          <select
            onChange={this.handleChange}
            className="browser-default"
            name="selectPlayers"
            onSubmit={this.submitVote}
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
          <button type="submit">Submit your guess</button>
        </form>
      </div>
    );
  }
}
