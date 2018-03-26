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
import Timer from "./Timer.jsx";

import {
  fetchGame,
  user,
  joinExistingGame,
  getMe,
  getPlayersInGame,
  fetchFacts,
  fetchDeaths,
  addVote,
  resetVotes,
  updateUser,
  removePlayer
} from "../store";

const tokboxApiKey = "46085992";
const tokboxSecret = "06b37a1f205fa56ddf7231f07889c585cbc1abb2";

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
      winner: ""
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
      this.props.loadData();
      this.daytime(payload);
    });
    socket.on("role", payload => this.assignRole(payload));
    socket.on("DetectiveRight", () => {
      this.detectiveAnswer("right");
    });
    socket.on("DetectiveWrong", () => {
      this.detectiveAnswer("wrong");
    });
    socket.on("myVote", dataVal => {
      this.props.releaseVote(dataVal);
    });
    socket.on("votesData", (votedOut, wasMafia) => {
      console.log(
        "inside votesData socket on front end, person voted out:",
        votedOut
      );
      this.giveVotesData(votedOut, wasMafia);
    });
    socket.on("resetVotes", () => {
      this.voteReset();
    });
    socket.on("gameOver", data => {
      this.gameOver(data);
    });
  }

  detectiveAnswer(choice) {
    this.setState({ detective: choice });
  }

  daytime(payload) {
    this.setState({ time: "day" });
    this.setState({ detective: "" });

    if (+payload.killed === this.props.user.id) {
      let died = this.props.players.find(player => {
        return +payload.killed === player.id;
      });
      let num = died.id % this.props.deaths.length;
      let death = this.props.deaths[num].storyForKilled;
      this.props.updateUser({
        role: "Dead",
        isAlive: false
      });
      this.setState({
        resultMessage: `${
          this.props.user.name
        } the Mafia got you in the night!! You ${death}`
      });
    }

    if (payload.killed && +payload.killed !== this.props.user.id) {
      let died = this.props.players.find(player => {
        return +payload.killed === player.id;
      });

      let num = died.id % this.props.deaths.length;
      let death = this.props.deaths[num].storyForAll;

      this.setState({
        resultMessage: `${
          died.name
        } was killed by the Mafia in the night! They ${death}`
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
    //only the creator will have access to this start button
  }

  dark() {
    socket.emit("startDarkTimer");
    this.setState({ time: "dark" });
  }

  darkOverMafia(killedId) {
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

  sendVotes(votes) {
    socket.emit("daytimeVotes", votes);
  }

  voteReset() {
    this.props.resetStoreVotes();
  }

  giveVotesData(name, wasMafia) {
    console.log("inside giveVotesData func, name: ", name);
    console.log("was mafia inside giveVotesData", wasMafia);
    //this.props.loadData();
    this.props.removePlayerFromStore(name);
    this.setState({ time: "day2" });
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

    const apiKey = "46085992";
    const {
      detective,
      error,
      connection,
      publishVideo,
      role,
      time,
      resultMessage,
      winner
    } = this.state;

    // const newVotes = votes;

    const index = Math.floor(Math.random() * Math.floor(facts.length - 1));

    const messageToMafia =
      "Mafia, please make yourselves known to each other! You can see and hear everyone, non-Mafia players cannot see you. Discuss your plans freely...";

    return (
      <div className="container">
        {!winner ? (
          <div>
            <div id="top-row" className="row">
              <div className="col s2">
                {!winner && time && <h4>Time:</h4>}
                {!winner && time && <h5>It's {time}!</h5>}
                {!winner && time && <Timer time={30} />}
              </div>

              <div className="col s10">
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
                {time === "day" && <h5>{resultMessage}</h5>}
                {time === "day2" && <h5>{resultMessage}</h5>}

                {winner && <h2>{winner} have won!</h2>}
                {!winner &&
                  user.role &&
                  time === "dark" &&
                  user.role !== "Dead" && (
                    <h2 id="role">You're a {user.role}</h2>
                  )}
                {user.role &&
                  time === "dark" &&
                  user.role === "Dead" && <h3>Boo..you're out of the game</h3>}
                {time === "dark" &&
                  user.role === "Detective" &&
                  detective && <h3>Detective, you were {detective}</h3>}
              </div>

              {/* <div className="col s4">
            <h5>Room Name: </h5>
            <h6>{game.roomName}</h6>
            {user.role &&
              time === "dark" &&
              user.role === "Dead" && <h3>Boo..you're out of the game</h3>}
            {players.length ? <h5>List of Alive Players:</h5> : null}
            {players.length ? (
              <ul>
                {players.map(player => (
                  <li className="players" key={player.id}>
                    {player.name}
                  </li>
                ))}
              </ul>
            ) : null}
          </div> */}
            </div>

            <div className="row">
              <div className="col s10 offset-s2">
                {time === "day" &&
                  user.role !== "Dead" && (
                    <div>
                      <h3>Who do you think the Mafia is?</h3>

                      <DayTimeForm
                        user={user.id}
                        players={this.props.players}
                      />
                    </div>
                  )}
                {time === "dark" &&
                  user.role === "Doctor" && (
                    <div>
                      <h4>Choose who to save</h4>
                      <DoctorSelectForm
                        players={this.props.players}
                        darkOverDoctor={this.darkOverDoctor}
                      />
                    </div>
                  )}
                {time === "dark" &&
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

                {time === "dark" &&
                  user.role === "Lead Mafia" && (
                    <div>
                      <h5>{messageToMafia}</h5>
                      <h4>Lead Mafia cast your decided vote below</h4>
                      <MafiaSelectForm
                        players={this.props.players}
                        darkOverMafia={this.darkOverMafia}
                      />
                    </div>
                  )}
                {time === "dark" &&
                  user.role === "Mafia" && (
                    <div>
                      <h5>{messageToMafia}</h5>
                    </div>
                  )}

                {time === "dark" &&
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
          <div> {winner} </div>
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
                          user.role &&
                          user.role !== "Mafia" &&
                          user.role !== "Lead Mafia" &&
                          user.role !== "Dead"
                            ? false
                            : true,
                        subscribeToVideo:
                          time === "dark" &&
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
          <div className="col s4">
            <h5>Room Name: </h5>
            <h6>{game.roomName}</h6>

            {players.length ? <h5>List of Alive Players:</h5> : null}
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
  fetchGame: PropTypes.func,
  getUser: PropTypes.func
};
