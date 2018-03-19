import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import tokboxApiKey from "../../secrets";
import { fetchGame, getUser } from "./store";

class GameRoom extends Component {
  constructor(props) {
    super(props);

    this.tokboxSession = this.tokboxSession.bind(this);
  }

  componentDidMount() {
    this.fetchGame.then(this.getUser).then(this.tokboxSession);
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
      var session = OT.initSession(tokboxApiKey, sessionId);

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
    <div id="videos">
      <div id="subscriber" />
      <div id="publisher" />
    </div>;
  }
}

const mapState = ({ user, game }) => ({ user, game });
const mapDispatch = { fetchGame, getUser };

export default connect(mapState, mapDispatch)(GameRoom);

/* PROP TYPES */
AuthForm.propTypes = {
  user: PropTypes.object,
  game: PropTypes.object,
  fetchGame: PropTypes.func,
  getUser: PropTypes.func
};
