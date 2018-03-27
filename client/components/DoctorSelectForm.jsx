import React, { Component } from "react";
import socket from "../socket";

export default class DoctorSelectForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: ""
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    socket.on("darkOverForVillagers", () => {
      this.props.darkOverDoctor(this.state.selected);
      this.setState({ selected: "" });
    });
  }

  componentWillUnmount() {
    socket.removeListener("darkOverForVillagers");
  }

  handleChange(event) {
    this.setState({ selected: event.target.value });
  }

  render() {
    const { darkOver, players } = this.props;
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
