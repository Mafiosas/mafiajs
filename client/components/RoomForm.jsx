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
          <label>Number of Players (defaults to 6)</label>
          <select className="browser-default" name="numPlayers">
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
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
      console.log("num players", evt.target.numPlayers.value);
      evt.preventDefault();
      const roomName = evt.target.roomName.value;
      const password = evt.target.password.value;
      const name = evt.target.name.value;
      const numPlayers = +evt.target.numPlayers.value;
      dispatch(
        addNewGame(roomName, password, name, numPlayers, ownProps.history)
      );
    }
  };
};

export default connect(null, mapCreateDispatch)(RoomForm);
