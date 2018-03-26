import React, { Component } from "react";
import socket from "../socket";

export default class DoctorSelectForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: ""
    };
    this.handleChange = this.handleChange.bind(this);
    socket.on("darkOverForVillagers", () => {
      console.log("dark is over for doctor");

      this.props.darkOverDoctor(this.state.selected);
      this.setState({ selected: "" });
    });
  }

  componentDidMount() {
    console.log("doctor component has mounted");
  }

  handleChange(event) {
    this.setState({ selected: event.target.value });
  }

  render() {
    const { darkOver, players } = this.props;
    console.log("players inside form", players);
    console.log("selected", this.state.selected);

    return (
      <div>
        <form>
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
