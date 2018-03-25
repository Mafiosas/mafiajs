import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { addNewGame, joinExistingGame } from "../store";
import Sound from "react-sound";

const RoomForm = props => {
  const { handleSubmit } = props;
  return (
    <div className="container">
      <Sound
        url="ayasiikuuki.MP3"
        loop="true"
        playStatus={Sound.status.PLAYING}
      />
      <Sound
        url="darkshadow.mp3"
        loop="true"
        playStatus={Sound.status.PLAYING}
      />
      <form id="room-form" onSubmit={handleSubmit}>
        <h4>Let's Play A Game...</h4>
        <div>
          <label>Room Name:</label>
          <input name="roomName" type="text" />
        </div>

        <div>
          <label>Password (optional):</label>
          <input name="password" type="text" />
        </div>
        <div>
          <label>Player Name:</label>
          <input name="name" />
          <button className="waves-effect waves-light btn" type="submit">
            Create Game
          </button>
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
      const name = evt.target.name.value;
      dispatch(addNewGame(roomName, password, name, ownProps.history));
    }
  };
};

export default connect(null, mapCreateDispatch)(RoomForm);
