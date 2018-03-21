import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import socket from "../socket";
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from "opentok-react";
import MafiaSelectForm from "./MafiaSelectForm.jsx";
import DetectiveSelectForm from "./DetectiveSelectForm.jsx";
import DoctorSelectForm from "./DoctorSelectForm.jsx";

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

    this.state = {
      time: "dark",
      error: null,
      connection: "Connecting",
      publishVideo: true
    };

    // this.tokboxSession = this.tokboxSession.bind(this);
    this.gameStart = this.gameStart.bind(this);
    this.getRoles = this.getRoles.bind(this);
    this.dark = this.dark.bind(this);
    this.darkOverMafia = this.darkOverMafia.bind(this);
    this.darkOverDetective = this.darkOverDetective.bind(this);
    this.darkOverDoctor = this.darkOverDoctor.bind(this);
    this.testingGame = this.testingGame.bind(this);

    this.sessionEventHandlers = {
      sessionConnected: () => {
        this.setState({ connection: "Connected" });
      },
      sessionDisconnected: () => {
        this.setState({ connection: "Disconnected" });
      },
      sessionReconnected: () => {
        this.setState({ connection: "Reconnected" });
      },
      sessionReconnecting: () => {
        this.setState({ connection: "Reconnecting" });
      }
    };

    this.publisherEventHandlers = {
      accessDenied: () => {
        console.log("User denied access to media source");
      },
      streamCreated: () => {
        console.log("Publisher stream created");
      },
      streamDestroyed: ({ reason }) => {
        console.log(`Publisher stream destroyed because: ${reason}`);
      }
    };

    this.subscriberEventHandlers = {
      videoEnabled: () => {
        console.log("Subscriber video enabled");
      },
      videoDisabled: () => {
        console.log("Subscriber video disabled");
      }
    };
  }

  componentDidMount() {
    this.props.fetchCurrentGame();
    this.props.findMe();
    this.props.loadPlayers();
    this.testingGame();
    // socket.emit(
    //   "joinGame",
    //   window.location.pathname.slice(
    //     window.location.pathname.lastIndexOf("/") + 1
    //   )
    // );
    socket.on("getRoles", this.getRoles);
    socket.on("dark", this.dark);
    socket.on("darkOver", this.darkOver);
  }

  componentWillReceiveProps() {
    //players && game.numPlayers == players.length && this.gameStart()
  }

  testingGame() {
    socket.emit("testingJoin", "5");
  }
  gameStart() {
    socket.emit("gameStart", this.props.game.id);
  }

  getRoles() {
    console.log("in get role");
    //make axios request to get me (user info)
    //how do we keep track of making sure EVERYONE get their role assigned before we tell the server?
    socket.emit("rolesAssigned");
  }
  dark() {
    console.log("in dark");
    socket.emit("startDarkTimer");
    this.setState({ time: "dark" });
  }

  darkOverMafia(killedId) {
    console.log("ohhhmmmyyygaaaaa dark isover for mafiaa");
    socket.emit("darkData", { killed: killedId });
  }

  darkOverDetective(guessId) {
    socket.emit("darkData", { guess: guessId });
  }

  darkOverDoctor(savedId) {
    socket.emit("darkData", { saved: savedId });
  }
  onSessionError = error => {
    this.setState({ error });
  };

  onPublish = () => {
    console.log("Publish Success");
  };

  onPublishError = error => {
    this.setState({ error });
  };

  onSubscribe = () => {
    console.log("Subscribe Success");
  };

  onSubscribeError = error => {
    this.setState({ error });
  };

  toggleVideo = () => {
    this.setState({ publishVideo: !this.state.publishVideo });
  };

  render() {
    const { user, game, players } = this.props;
    console.log("socket in game room", socket);
    const sessionId = game.sessionId;

    const token = user.token;

    const apiKey = "46081452";
    const { error, connection, publishVideo } = this.state;

    // console.log("this.state", this.state);
    return (
      <div className="container">
        {" "}
        {players && game.numPlayers === players.length && this.gameStart()}
        {game.id &&
          user.id && (
            <div>
              <h1>{game.roomName}</h1>
              <OTSession
                apiKey={apiKey}
                sessionId={sessionId}
                token={token}
                onError={this.onSessionError}
                eventHandlers={this.sessionEventHandlers}
              >
                <OTPublisher
                  properties={{ publishVideo, width: 150, height: 150 }}
                  onPublish={this.onPublish}
                  onError={this.onPublishError}
                  eventHandlers={this.publisherEventHandlers}
                />
                <OTStreams>
                  <OTSubscriber
                    properties={{
                      width: 250,
                      height: 250,
                      subscribeToAudio:
                        this.state.time === "dark" && user.role !== "Mafia"
                          ? false
                          : true,
                      subscribeToVideo:
                        this.state.time === "dark" && user.role !== "Mafia"
                          ? false
                          : true
                    }}
                    onSubscribe={this.onSubscribe}
                    onError={this.onSubscribeError}
                    eventHandlers={this.subscriberEventHandlers}
                  />
                </OTStreams>
              </OTSession>
            </div>
          )}
        {this.state.time === "dark" &&
          user.role === "Civilian" && (
            <div>
              <DarkCiv />
            </div>
          )}
        {this.state.time === "dark" &&
          user.role === "Doctor" && (
            <div>
              <h1>Doctor, choose who to save</h1>
              <DoctorSelectForm
                players={this.props.players}
                darkOverDoctor={this.darkOverDoctor}
              />
            </div>
          )}
        {this.state.time === "dark" &&
          user.role === "Detective" && (
            <div>
              <h1>Detective, choose who you think is Mafia</h1>
              <DetectiveSelectForm
                players={this.props.players}
                darkOverDetective={this.darkOverDetective}
              />
            </div>
          )}
        {this.state.time === "dark" &&
          user.role === "Mafia" && (
            <div>
              <h1>Mafia, choose who to kill</h1>
              <MafiaSelectForm
                players={this.props.players}
                darkOverMafia={this.darkOverMafia}
              />
            </div>
          )}
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
