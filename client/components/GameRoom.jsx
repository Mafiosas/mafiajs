import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import socket from "../socket";
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from "opentok-react";
import MafiaSelectForm from "./MafiaSelectForm.jsx";
import DetectiveSelectForm from "./DetectiveSelectForm.jsx";
import DoctorSelectForm from "./DoctorSelectForm.jsx";
import DarkCiv from "./DarkCiv.jsx";

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
      time: "",
      error: null,
      connection: "Connecting",
      publishVideo: true,
      role: "",
      isAlive: true
    };

    this.gameStart = this.gameStart.bind(this);
    this.getRoles = this.getRoles.bind(this);
    this.dark = this.dark.bind(this);
    this.darkOverMafia = this.darkOverMafia.bind(this);
    this.darkOverDetective = this.darkOverDetective.bind(this);
    this.darkOverDoctor = this.darkOverDoctor.bind(this);
    this.testingGame = this.testingGame.bind(this);
    this.assignRole = this.assignRole.bind(this);
    this.daytime = this.daytime.bind(this);

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
    socket.on("getRoles", this.getRoles);
    socket.on("dark", this.dark);
    socket.on("daytime", this.daytime);
    socket.on("role", payload => this.assignRole(payload));
    socket.on("DetectiveRight", () => {
      console.log("detective right");
    });
    socket.on("DetectiveWrong", () => {
      console.log("detective wrong");
    });
  }

  daytime() {
    console.log("client has reached daytime");
    this.setState({ time: "Day" });
  }

  assignRole(role) {
    this.setState({ role });
    console.log("we assigned role!");
  }
  testingGame() {
    socket.emit("testingJoin", "5");
  }
  gameStart() {
    socket.emit("gameStart", this.props.game.id);
    //only the creator will have access to this start button
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
    socket.emit("darkData", { killed: killedId, gameId: this.props.game.id });
  }

  darkOverDetective(guessId) {
    socket.emit("villagerChoice", {
      guess: guessId,
      gameId: this.props.game.id
    });
  }

  darkOverDoctor(savedId) {
    socket.emit("villagerChoice", {
      saved: savedId,
      gameId: this.props.game.id
    });
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
    const { error, connection, publishVideo, role, time } = this.state;

    // console.log("this.state", this.state);
    return (
      <div className="container">
        <h1>It's {time}!</h1>
        {!role &&
          user.creator &&
          game.numPlayers === players.length && (
            <button onClick={this.gameStart}>You're all here</button>
          )}
        {game.id &&
          user.id && (
            <div>
              <h1>{game.roomName}</h1>
              {role && <h2>You're a {role}</h2>}
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
                        time === "dark" &&
                        role &&
                        role !== "Mafia" &&
                        role !== "Lead Mafia"
                          ? false
                          : true,
                      subscribeToVideo:
                        time === "dark" &&
                        role &&
                        role !== "Mafia" &&
                        role !== "Lead Mafia"
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
        {time === "dark" && role === "Civilian" && <div />}
        {time === "dark" &&
          role === "Doctor" && (
            <div>
              <h1>Doctor, choose who to save</h1>
              <DoctorSelectForm
                players={this.props.players}
                darkOverDoctor={this.darkOverDoctor}
              />
            </div>
          )}
        {time === "dark" &&
          role === "Detective" && (
            <div>
              <h1>Detective, choose who you think is Mafia</h1>
              <DetectiveSelectForm
                players={this.props.players}
                darkOverDetective={this.darkOverDetective}
              />
            </div>
          )}
        {time === "dark" &&
          role === "Lead Mafia" && (
            <div>
              <h1>Lead Mafia, choose who to kill</h1>
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
