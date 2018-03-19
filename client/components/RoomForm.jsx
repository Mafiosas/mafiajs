import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { addNewGame, joinExistingGame } from "../store";

const RoomForm = props => {
  const { handleSubmit } = props;
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Room Name:</label>
          <input name="roomName" type="text" />
        </div>

        <div>
          <label>Password:</label>
          <input name="password" type="text" />
        </div>
        <div>
          <button type="submit">Create Game</button>
        </div>
        {error && error.response && <div> {error.response.data} </div>}
      </form>
    </div>
  );
};

const mapCreateDispatch = dispatch => {
  return {
    handleSubmit(evt) {
      evt.preventDefault();
      const roomName = evt.target.roomName.value;
      const password = evt.target.password.value;
      dispatch(addNewGame(roomName, password));
    }
  };
};

export const CreateAGame = connect(mapCreate, mapCreateDispatch)(RoomForm);

/* PROP TYPES */
AuthForm.propTypes = {
  name: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.object
};
