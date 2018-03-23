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
import DayTimeForm from "./DayTimeForm.jsx";

import {
  fetchGame,
  user,
  joinExistingGame,
  getMe,
  getPlayersInGame,
  fetchFacts,
  fetchDeaths,
  addVote
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
      resultMessage: ""
    };

    this.gameStart = this.gameStart.bind(this);

    this.dark = this.dark.bind(this);
    this.darkOverMafia = this.darkOverMafia.bind(this);
    this.darkOverDetective = this.darkOverDetective.bind(this);
    this.darkOverDoctor = this.darkOverDoctor.bind(this);
    this.assignRole = this.assignRole.bind(this);
    this.daytime = this.daytime.bind(this);
    this.detectiveAnswer = this.detectiveAnswer.bind(this);

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
    this.props.loadFacts();
    this.props.loadDeaths();

    socket.on("getRoles", this.getRoles);
    socket.on("dark", this.dark);
    socket.on("daytime", payload => this.daytime(payload));
    socket.on("role", payload => this.assignRole(payload));
    socket.on("DetectiveRight", () => {
      this.detectiveAnswer("right");
    });
    socket.on("DetectiveWrong", () => {
      this.detectiveAnswer("wrong");
    });
    socket.on("myVote", dataVal => {
      dispatch(addVote(dataVal));
    });
  }

  detectiveAnswer(choice) {
    this.setState({ detective: choice });
  }

  daytime(payload) {
    this.setState({ time: "day" });

    if (+payload.killed === this.props.user.id) {
      this.setState({ role: "Dead" });
    }

    if (payload.killed) {
      let died = this.props.players.find(player => {
        return +payload.killed === player.id;
      });
      let num = died.id % this.props.deaths.length;
      let death = this.props.deaths[num].story;

      this.setState({
        resultMessage: `${died.name} ${death}`
      });
    }

    if (payload.saved) {
      let saved = this.props.players.find(player => {
        return +payload.saved === player.id;
      });
      this.setState({
        resultMessage: `Nobody died! ${saved.name} was saved by the Doctor`
      });
    }
  }

  assignRole(role) {
    this.setState({ role });
    console.log("we assigned role!");
  }

  gameStart() {
    socket.emit("gameStart", this.props.game.id);
    //only the creator will have access to this start button
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
    const { user, game, players, facts } = this.props;
    const sessionId = game.sessionId;

    const token = user.token;

    const apiKey = "46081452";
    const {
      detective,
      error,
      connection,
      publishVideo,
      role,
      time
    } = this.state;

    const index = Math.floor(Math.random() * Math.floor(facts.length - 1));

    const messageToMafia =
      "Mafia, you can see and hear everyone, they cannot see you! Discuss your plans freely...";

    // console.log("this.state", this.state);
    return (
      <div className="container">
        <div className="row">
          <div className="col s6">
            <h1>{game.roomName}</h1>
          </div>
          <div className="col s6">
            {role && <h2>You're a {role}</h2>}
            {time && <h1>It's {time}!</h1>}
          </div>
        </div>
        <div className="row">
          {!role &&
            user.creator &&
            game.numPlayers === players.length && (
              <button onClick={this.gameStart}>
                Ready? Click here to begin your game of MAFIA
              </button>
            )}
          {time === "dark" && role === "Mafia" && <h5>{messageToMafia}</h5>}
        </div>
        <div className="row">
          <div className="col s9">
            {time === "day" &&
              role !== "Dead" && (
                <div>
                  <h3>Who do you think the Mafia is?</h3>
                  <DayTimeForm players={this.props.plaers} />
                </div>
              )}
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
                    user={user.id}
                    players={this.props.players}
                    darkOverDetective={this.darkOverDetective}
                  />
                </div>
              )}
            {time === "dark" &&
              role === "Lead Mafia" && (
                <div>
                  <h5>{messageToMafia}</h5>
                  <h1>Lead Mafia, choose who to kill</h1>
                  <MafiaSelectForm
                    players={this.props.players}
                    darkOverMafia={this.darkOverMafia}
                  />
                </div>
              )}

            {time === "dark" &&
              role === "Civilian" && (
                <div>
                  <h4>{facts[index].fact}</h4>
                </div>
              )}
          </div>
          <div className="col s3">
            {time === "day" && <h5>{this.state.resultMessage}</h5>}
          </div>
        </div>
        <div className="row">
          {game.id &&
            user.id && (
              <div>
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
                          role !== "Lead Mafia" &&
                          role !== "Dead"
                            ? false
                            : true,
                        subscribeToVideo:
                          time === "dark" &&
                          role &&
                          role !== "Mafia" &&
                          role !== "Lead Mafia" &&
                          role !== "Dead"
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
        </div>
      </div>
    );
  }
}

const mapState = ({ user, game, players, deaths, facts }) => ({
  user,
  game,
  players,
  deaths,
  facts
});

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
    },

    loadDeaths() {
      dispatch(fetchDeaths());
    },

    loadFacts() {
      dispatch(fetchFacts());
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
