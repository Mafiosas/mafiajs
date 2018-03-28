import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import socket from "../socket";
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from "opentok-react";
import MafiaSelectForm from "./MafiaSelectForm.jsx";
import DetectiveSelectForm from "./DetectiveSelectForm.jsx";
import DoctorSelectForm from "./DoctorSelectForm.jsx";
import DayTimeForm from "./DayTimeForm.jsx";
import sounds from "./sound.jsx";
import Timer from "./Timer.jsx";
import Sound from "react-sound";

import {
  fetchGame,
  user,
  joinExistingGame,
  getMe,
  getOnlyMe,
  fetchFacts,
  fetchDeaths,
  addVote,
  resetVotes,
  updateUser,
  removePlayer
} from "../store";

class GameRoom extends Component {
  constructor(props) {
    super(props);

    this.state = {
      time: "",
      error: null,
      connection: "Connecting",
      publishVideo: true,
      resultMessage: "",
      detective: "",
      winner: "",
      timerToggle: 0,
      playStatusNight: "STOPPED",
      playStatusDay: "STOPPED",
      died: {}
    };

    this.gameStart = this.gameStart.bind(this);

    this.dark = this.dark.bind(this);
    this.darkOverMafia = this.darkOverMafia.bind(this);
    this.darkOverDetective = this.darkOverDetective.bind(this);
    this.darkOverDoctor = this.darkOverDoctor.bind(this);
    this.assignRole = this.assignRole.bind(this);
    this.daytime = this.daytime.bind(this);
    this.detectiveAnswer = this.detectiveAnswer.bind(this);
    this.sendVotes = this.sendVotes.bind(this);
    this.voteReset = this.voteReset.bind(this);
    this.gameOver = this.gameOver.bind(this);
    this.getRoles = this.getRoles.bind(this);

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
    this.props.loadData();
    this.props.loadFacts();
    this.props.loadDeaths();
    socket.on("getRoles", this.getRoles);
    socket.on("dark", this.dark);
    socket.on("daytime", payload => {
      // this.props.loadData();
      this.props.loadMe();
      this.daytime(payload);
    });
    socket.on("role", payload => this.assignRole(payload));
    socket.on("DetectiveChoice", choice => {
      const answer = choice ? "right" : "wrong";
      this.detectiveAnswer(answer);
    });
    socket.on("myVote", dataVal => {
      this.props.releaseVote(dataVal);
    });
    socket.on("votesData", (votedOut, wasMafia) => {
      this.giveVotesData(votedOut, wasMafia);
    });
    socket.on("resetVotes", () => {
      this.voteReset();
    });
    socket.on("gameOver", data => {
      this.gameOver(data);
    });
  }

  componentWillUnmount() {
    this.setState({
      time: "",
      error: null,
      connection: "Connecting",
      publishVideo: true,
      resultMessage: "",
      detective: "",
      winner: "",
      timerToggle: 0,
      playStatusNight: "STOPPED",
      playStatusDay: "STOPPED",
      died: {}
    });
    socket.removeListener("getRoles");
    socket.removeListener("dark");
    socket.removeListener("daytime");
    socket.removeListener("role");
    socket.removeListener("DetectiveRight");
    socket.removeListener("DetectiveWrong");
    socket.removeListener("myVote");
    socket.removeListener("votesData");
    socket.removeListener("resetVotes");
    socket.removeListener("gameOver");
  }
  getRoles() {
    this.props.loadMe();
  }

  detectiveAnswer(choice) {
    this.setState({ detective: choice });
  }

  daytime(payload) {
    this.setState({
      time: "Day",
      detective: "",
      playStatusDay: "PLAYING",
      playStatusNight: "STOPPED"
    });

    let num;

    if (payload.killed) {
      let died = this.props.players.find(player => {
        return +payload.killed === player.id;
      });
      this.setState({ died });
      this.props.removePlayerFromStore(+payload.killed);
    }

    if (+payload.killed === this.props.user.id) {
      num = this.state.died.id % this.props.deaths.length;
      let death = this.props.deaths[num].storyForKilled;
      this.props.updateUser({
        role: "Dead",
        isAlive: false
      });
      this.setState({
        resultMessage: `${
          this.props.user.name
        }, the Mafia got you in the night! You ${death}`
      });
    }

    if (payload.killed && +payload.killed !== this.props.user.id) {
      num = this.state.died.id % this.props.deaths.length;
      let death = this.props.deaths[num].storyForAll;
      this.setState({
        resultMessage: ` The Mafia struck again in the night! ${
          this.state.died.name
        } ${death}`
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

  gameOver(data) {
    this.props.fetchCurrentGame();
    this.setState({ winner: data });
  }

  assignRole(role) {
    this.props.updateUser({
      role: role,
      isAlive: true
    });
  }

  gameStart() {
    socket.emit("gameStart", this.props.game.id);
  }

  dark() {
    this.setState({
      time: "Night",
      timerToggle: 30,
      playStatusNight: "PLAYING",
      playStatusDay: "STOPPED"
    });
  }

  darkOverMafia(killedId) {
    socket.emit("darkData", {
      killed: killedId,
      gameId: this.props.game.id,
      user: this.props.user
    });
  }

  darkOverDetective(guessId) {
    socket.emit("villagerChoice", {
      guess: guessId,
      gameId: this.props.game.id,
      user: this.props.user
    });
  }

  darkOverDoctor(savedId) {
    socket.emit("villagerChoice", {
      saved: savedId,
      gameId: this.props.game.id,
      user: this.props.user
    });
  }

  sendVotes(votes) {
    socket.emit("daytimeVotes", votes);
  }

  voteReset() {
    this.props.resetStoreVotes();
  }

  giveVotesData(name, wasMafia) {
    const player = this.props.players.find(el => el.name === name);
    this.props.removePlayerFromStore(player.id);
    this.setState({ time: "day2", timerToggle: 30 });
    if (this.props.user.name === name && !wasMafia) {
      this.setState({
        resultMessage:
          "The group guessed you to be the Mafia and were wrong! You are now out of the game."
      });
      this.props.updateUser({
        role: "Dead",
        isAlive: false
      });
    } else if (this.props.user.name !== name && !wasMafia) {
      this.setState({
        resultMessage: `You were wrong! ${name} is not Mafia, and is now out of the game.`
      });
    } else if (this.props.user.name === name && wasMafia) {
      this.setState({
        resultMessage:
          "The group was right! They guessed you as Mafia and you have been voted out the game."
      });
      this.props.updateUser({
        role: "Dead",
        isAlive: false
      });
    } else if (this.props.user.name !== name && wasMafia) {
      this.setState({
        resultMessage: `You were right! ${name} was Mafia and is now out of the game.`
      });
    }
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
    const { user, game, players, facts, votes } = this.props;
    const sessionId = game.sessionId;

    const token = user.token;

    const apiKey = "46088972";
    const {
      detective,
      error,
      connection,
      publishVideo,
      time,
      resultMessage,
      winner,
      playStatusNight,
      playStatusDay
    } = this.state;

    const index = Math.floor(Math.random() * Math.floor(facts.length - 1));

    const messageToMafia =
      "Mafia, please make yourselves known to each other! You can see and hear everyone, they cannot see you. Discuss your plans freely...";

    return (
      <div>
        <Sound url="owl.mp3" playStatus={playStatusNight} />
        <Sound url="rooster.mp3" playStatus={playStatusDay} />

        <div className="container">
          {!winner ? (
            <div>
              <div id="top-row" className="row">
                <div className="col s3">
                  {time &&
                    time !== "day2" && (
                      <div>
                        <h4>Time:</h4>
                        <h6>{time}</h6>
                      </div>
                    )}

                  {time &&
                    time === "day2" && (
                      <div>
                        <h4>Time:</h4>
                        <h6>Day</h6>
                      </div>
                    )}
                  <br />
                  {time === "day2" && (
                    <div className="countdown">
                      <h5>Countdown: </h5>
                      <Timer timer={this.state.timerToggle} />
                    </div>
                  )}
                  {time === "Night" && (
                    <div className="countdown">
                      <h5>Countdown: </h5>
                      <Timer timer={this.state.timerToggle} />
                    </div>
                  )}
                </div>
                <br />

                {time === "Night" && <img id="owl" src="/wideMoon.gif" />}
                <div className="col s9">
                  {!user.role &&
                    user.creator &&
                    game.numPlayers === players.length && (
                      <button
                        onClick={this.gameStart}
                        className="waves-effect waves-light btn"
                      >
                        Ready? Click here to begin your game of MAFIA
                      </button>
                    )}
                  {time === "Day" && <h5>{resultMessage}</h5>}
                  {time === "day2" && <h5>{resultMessage}</h5>}

                  {user.role &&
                    time === "Night" &&
                    user.role !== "Dead" && (
                      <h2 id="role">You're a {user.role}</h2>
                    )}
                  {user.role &&
                    time === "Night" &&
                    user.role === "Dead" && (
                      <h3>Boo..you're out of the game</h3>
                    )}
                  {time === "Night" &&
                    user.role === "Detective" &&
                    detective && <h3>Detective, you were {detective}</h3>}
                </div>
              </div>

              <div className="row">
                <div className="col s3">
                  <h5>Room Name: </h5>
                  <h6>{game.roomName}</h6>
                  <br />

                  {players.length ? <h5>Alive Players:</h5> : null}
                  {players.length ? (
                    <ul>
                      {players.map(player => (
                        <li className="players" key={player.id}>
                          {player.name}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="col s9">
                  {time === "Day" &&
                    user.role !== "Dead" && (
                      <div>
                        <h3>Who do you think the Mafia is?</h3>

                        <DayTimeForm
                          user={user.id}
                          players={this.props.players}
                        />
                      </div>
                    )}
                  {time === "Night" &&
                    user.role === "Doctor" && (
                      <div>
                        <h4>Choose who to save</h4>
                        <DoctorSelectForm
                          players={this.props.players}
                          darkOverDoctor={this.darkOverDoctor}
                        />
                      </div>
                    )}
                  {time === "Night" &&
                    user.role === "Detective" &&
                    !detective && (
                      <div>
                        <h4>Choose who you suspect is Mafia</h4>
                        <DetectiveSelectForm
                          user={user.id}
                          players={this.props.players}
                          darkOverDetective={this.darkOverDetective}
                        />
                      </div>
                    )}

                  {time === "Night" &&
                    user.role === "Lead Mafia" && (
                      <div>
                        <h5>{messageToMafia}</h5>
                        <br />
                        <h4>Lead Mafia cast your decided vote below</h4>
                        <MafiaSelectForm
                          players={this.props.players}
                          darkOverMafia={this.darkOverMafia}
                        />
                      </div>
                    )}
                  {time === "Night" &&
                    user.role === "Mafia" && (
                      <div>
                        <h5>{messageToMafia}</h5>
                      </div>
                    )}

                  {time === "Night" &&
                    user.role === "Civilian" && (
                      <div>
                        <p>{facts[index].fact}</p>
                      </div>
                    )}
                </div>
              </div>

              <div className="row">
                <div className="col s10 offset-s2">
                  {Object.keys(votes).length == players.length &&
                    user.id == +Object.keys(votes)[0] &&
                    this.sendVotes(votes)}
                  {console.log(Object.keys(votes))}
                  {Object.keys(votes).length ? (
                    <div>
                      <table className="votedTable">
                        <thead>
                          <tr>
                            <th>Who Voted</th>
                            <th>For Who?</th>
                          </tr>
                        </thead>

                        <tbody>
                          {Object.keys(votes).map(key => {
                            let whoVotedId = players.find(player => {
                              return player.id === +key;
                            });
                            let whoForId = players.find(player => {
                              return player.id === +votes[key];
                            });
                            return (
                              <tr key={key}>
                                <td>{whoVotedId.name}</td>
                                <td>{whoForId.name}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <h2>{winner} have won!</h2>
          )}

          <div className="row">
            {game.id &&
              user.id && (
                <div className="col s8">
                  <OTSession
                    apiKey={apiKey}
                    sessionId={sessionId}
                    token={token}
                    onError={this.onSessionError}
                    eventHandlers={this.sessionEventHandlers}
                  >
                    <OTPublisher
                      properties={{
                        publishVideo,
                        width: 150,
                        height: 150,
                        name: user.name
                      }}
                      onPublish={this.onPublish}
                      onError={this.onPublishError}
                      eventHandlers={this.publisherEventHandlers}
                    />
                    <OTStreams>
                      <OTSubscriber
                        properties={{
                          width: 200,
                          height: 200,
                          subscribeToAudio:
                            time === "Night" &&
                            user.role &&
                            user.role !== "Mafia" &&
                            user.role !== "Lead Mafia" &&
                            user.role !== "Dead"
                              ? false
                              : true,
                          subscribeToVideo:
                            time === "Night" &&
                            user.role &&
                            user.role !== "Mafia" &&
                            user.role !== "Lead Mafia" &&
                            user.role !== "Dead"
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
      </div>
    );
  }
}

const mapState = ({ user, game, players, deaths, facts, votes }) => ({
  user,
  game,
  players,
  deaths,
  facts,
  votes
});

const mapDispatch = (dispatch, ownProps) => {
  return {
    fetchCurrentGame() {
      dispatch(fetchGame(+ownProps.match.params.gameId));
    },

    loadData() {
      dispatch(getMe(+ownProps.match.params.gameId));
    },

    loadMe() {
      dispatch(getOnlyMe());
    },

    loadDeaths() {
      dispatch(fetchDeaths());
    },

    loadFacts() {
      dispatch(fetchFacts());
    },

    releaseVote(dataVal) {
      dispatch(addVote(dataVal));
    },

    resetStoreVotes() {
      dispatch(resetVotes());
    },
    updateUser(data) {
      dispatch(updateUser(data));
    },
    removePlayerFromStore(player) {
      dispatch(removePlayer(player));
    }
  };
};

export default withRouter(connect(mapState, mapDispatch)(GameRoom));

/* PROP TYPES */
GameRoom.propTypes = {
  user: PropTypes.object,
  game: PropTypes.object,
  players: PropTypes.array,
  deaths: PropTypes.array,
  facts: PropTypes.array,
  votes: PropTypes.object
};
