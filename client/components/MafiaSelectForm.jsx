import React, { Component } from "react";
import socket from "../socket";

export default class MafiaSelectForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: ""
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    console.log("mafia component has mounted");

    socket.on("darkOverForMafia", () => {
      console.log("dark is over for mafia");
      this.props.darkOverMafia(this.state.selected);
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

// const mapState = ({ players }) => ({ players });
// const mapDispatch = { getPlayers };

// export default connect(mapState, mapDispatch)(SelectPlayerForm);
