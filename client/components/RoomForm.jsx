import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { addNewGame } from "../store";

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
      </form>
    </div>
  );
};

const mapCreateDispatch = (dispatch, ownProps) => {
  return {
    handleSubmit(evt) {
      evt.preventDefault();
      const roomName = evt.target.roomName.value;
      const password = evt.target.password.value;
      dispatch(addNewGame(roomName, password, ownProps.history));
    }
  };
};

export default connect(null, mapCreateDispatch)(RoomForm);
