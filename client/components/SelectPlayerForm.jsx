import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getPlayers } from "../store";

const SelectPlayerForm = props => {
  //need to pass a handleSubmit down from parent component
  const { handleSubmit, players } = props;
  console.log("players inside form", players);
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Pick A Player:</label>
        <select className="browser-default" name="selectPlayers">
          {players.length &&
            players.map(player => {
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
};

export default SelectPlayerForm;

// const mapState = ({ players }) => ({ players });
// const mapDispatch = { getPlayers };

// export default connect(mapState, mapDispatch)(SelectPlayerForm);
