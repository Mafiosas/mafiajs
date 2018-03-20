import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import socket from "../socket";

import {
  fetchGame,
  user,
  joinExistingGame,
  getMe,
  getPlayersInGame
} from "../store";

const tokboxApiKey = "46081452";
const tokboxSecret = "3d9f569b114ccfa5ae1e545230656c6adb5465d3";

class GameRoom extends Component {
  constructor(props) {
    super(props);

    this.tokboxSession = this.tokboxSession.bind(this);
    this.gameStart = this.gameStart.bind(this);
  }

  componentDidMount() {
    this.props.fetchCurrentGame();
    this.props.findMe();
    this.props.loadPlayers();
    socket.emit(
      "joinGame",
      window.location.pathname.slice(
        window.location.pathname.lastIndexOf("/") + 1
      )
    );
  }

  gameStart() {
    socket.emit("gameStart", this.props.game.id);
  }

  tokboxSession() {
    const sessionId = this.props.game.sessionId;

    const playerToken = this.props.user.token;

    initializeSession();

    // Handling all of our errors here by alerting them
    function handleError(error) {
      if (error) {
        alert(error.message);
      }
    }

    function initializeSession() {
      console.log("tokbox", tokboxApiKey);
      console.log("sessionId", sessionId);
      var session = OT.initSession("46081452");

      // Subscribe to a newly created stream
      session.on("streamCreated", function(event) {
        session.subscribe(
          event.stream,
          "subscriber",
          {
            insertMode: "append",
            width: "250px",
            height: "250px"
          },
          handleError
        );
      });

      // Create a publisher
      var publisher = OT.initPublisher(
        "publisher",
        {
          insertMode: "append",
          width: "250px",
          height: "250px"
        },
        handleError
      );

      // Connect to the session
      session.connect(playerToken, function(error) {
        // If the connection is successful, publish to the session
        if (error) {
          handleError(error);
        } else {
          session.publish(publisher, handleError);
        }
      });
    }
  }

  render() {
    const { user, game, players } = this.props;
    console.log("socket", socket);
    return (
      <div>
        {" "}
        {game.id && this.tokboxSession()}
        {players && game.numPlayers == players.length && this.gameStart()}
        <div id="videos">
          <h1>afterUser</h1>
          <div id="subscriber" />
          <div id="publisher" />
        </div>
      </div>
    );
  }
}

const mapState = ({ user, game, players }) => ({ user, game, players });

const mapDispatch = (dispatch, ownProps) => {
  return {
    fetchCurrentGame() {
      dispatch(fetchGame(+ownProps.match.params.gameId));
    },

    findMe() {
      dispatch(getMe());
    },

    loadPlayers() {
      dispatch(getPlayersInGame(+ownProps.match.params.gameId));
    }
  };
};

export default withRouter(connect(mapState, mapDispatch)(GameRoom));

/* PROP TYPES */
GameRoom.propTypes = {
  user: PropTypes.object,
  game: PropTypes.object,
  fetchGame: PropTypes.func,
  getUser: PropTypes.func
};
