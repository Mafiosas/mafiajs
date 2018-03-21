import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getPlayers } from "../store";

class SelectPlayerForm extends Component {
  render() {
    //need to pass a handleSubmit down from parent component
    const { handleSubmit, players } = props;
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <label>Pick A Player:</label>
          <select name="selectPlayers">
            {players.map(player => {
              return (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              );
            })}
          </select>
          <button>Submit</button>
        </form>
      </div>
    );
  }
}

const mapState = ({ players }) => ({ players });
const mapDispatch = { getPlayers };

export default connect(mapState, mapDispatch)(SelectPlayerForm);
