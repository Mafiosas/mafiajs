import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { fetchGame, user, joinExistingGame } from "../store";

const tokboxApiKey = "46081452";
const tokboxSecret = "3d9f569b114ccfa5ae1e545230656c6adb5465d3";

class GameRoom extends Component {
  constructor(props) {
    super(props);

    this.tokboxSession = this.tokboxSession.bind(this);
  }

  componentDidMount() {
    this.props.fetchCurrentGame();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.user.id && nextProps.user.id) {
      this.tokboxSession();
    }
  }

  tokboxSession() {
    const sessionId = this.props.game.sessionId;
    console.log("sessionId", this.props.game.sessionId);
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
    const { user, game, handleSubmit } = this.props;
    return (
      <div>
        {user.id ? (
          <div id="videos">
            <h1>afterUser</h1>
            <div id="subscriber" />
            <div id="publisher" />
          </div>
        ) : (
          <div>
            <h1>beforeUser</h1>
            <form onSubmit={handleSubmit}>
              <input name="name" placeholder="enter your first name" />
              <button>Go!</button>
            </form>
          </div>
        )}
      </div>
    );
  }
}

const mapState = ({ user, game }) => ({ user, game });

const mapDispatch = (dispatch, ownProps) => {
  return {
    fetchCurrentGame() {
      fetchGame(ownProps.match.params.gameId);
    },
    handleSubmit(evt) {
      evt.preventDefault();
      const name = evt.target.name.value;
      dispatch(joinExistingGame(ownProps.match.params.gameId, name));
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
