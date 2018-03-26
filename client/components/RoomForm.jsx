import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { addNewGame, joinExistingGame } from "../store";
import Sound from "react-sound";

class RoomForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "",
      disabled: true
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    let target = event.target.value.length;
    if (target > 0)
      this.setState({
        disabled: false
      });
    else this.setState({ disabled: true });
    this.setState({ input: event.target.value });
  }

  render() {
    const { handleSubmit } = this.props;
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
        <h2>Let's Play A Game...</h2>
        <form id="room-form" onSubmit={handleSubmit}>
          <div>
            <label>Room Name:</label>
            <input
              name="roomName"
              type="text"
              placeholder="Enter a room name"
            />
          </div>

          <div>
            <label>Password (optional):</label>
            <input name="password" type="text" placeholder="Enter a password" />
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
            <input
              name="name"
              onChange={this.handleChange}
              placeholder="Enter your name"
            />
            <button
              className="waves-effect waves-light btn"
              type="submit"
              disabled={this.state.disabled}
            >
              Create Game
            </button>
          </div>
        </form>
      </div>
    );
  }
}

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
