import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import tokboxApiKey from "../../secrets";
import { fetchGame, user, joinExistingGame } from "../store";

class GameRoom extends Component {
  constructor(props) {
    super(props);

    this.tokboxSession = this.tokboxSession.bind(this);
  }

  componentDidMount() {
    this.props.fetchGame(this.props.match.params.gameId);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.user && nextProps.user) {
      this.tokboxSession();
    }
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
    const { user, game, handleSubmit } = props;
    return (
      <div>
        {user ? (
          <div id="videos">
            <div id="subscriber" />
            <div id="publisher" />
          </div>
        ) : (
          <div>
            <form onSubmit={handleSubmit}>
              <input name="name" placeholder="enter your first name" />
            </form>
          </div>
        )}
      </div>
    );
  }
}

const mapState = ({ user, game }) => ({ user, game });

const mapDispatch = dispatch => {
  return {
    fetchGame(id) {
      fetchGame(id);
    },
    handleSubmit(evt, ownProps) {
      evt.preventDefault();
      const name = evt.target.name.value;
      dispatch(joinExistingGame(ownProps.match.params.gameId, name)).then(
        () => {
          tokboxSession();
        }
      );
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
