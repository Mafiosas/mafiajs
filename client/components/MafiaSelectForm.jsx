import React, { Component } from "react";
import socket from "../socket";
import PropTypes from "prop-types";

export default class MafiaSelectForm extends Component {
  constructor(props) {
    super(props);
    this.state = { selected: "" };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    socket.on("darkOverForMafia", () => {
      this.props.darkOverMafia(this.state.selected);
      this.setState({ selected: "" });
    });
  }

  componentWillUnmount() {
    socket.removeListener("darkOverForMafia");
  }

  handleChange(event) {
    this.setState({
      selected: event.target.value
    });
  }

  render() {
    const { players } = this.props;
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

/* PROP TYPES */
MafiaSelectForm.propTypes = {
  players: PropTypes.array
};
