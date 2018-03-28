import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { fetchGames, joinExistingGame } from "../store";
import Sound from "react-sound";
import { Modal, Button, Icon } from "react-materialize";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      name: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
  }

  componentDidMount() {
    this.props.getGames();
  }

  handleChange(event) {
    this.setState({ password: event.target.value });
  }

  handleNameChange(event) {
    this.setState({ name: event.target.value });
  }
  render() {
    const { games, handleSubmit } = this.props;
    return (
      <div>
        <Sound
          url="ayasiikuuki.MP3"
          loop={true}
          playStatus={Sound.status.PLAYING}
        />
        <Sound
          url="darkshadow.mp3"
          loop={true}
          playStatus={Sound.status.PLAYING}
        />

        <h1 id="mobileHeader">MAFIA</h1>
        <div className="row">
          <div className="col s2" id="sidebar">
            {games.length ? (
              <div>
                <div id="roomTitle">Existing Rooms:</div>
                {games.map(game => {
                  return (
                    <div className="rooms" key={game.id}>
                      <div className="roomName">{game.roomName}</div>
                      <form onSubmit={event => handleSubmit(event, game.id)}>
                        <label id="front-page">Enter your first name:</label>
                        <input
                          type="text"
                          onChange={this.handleNameChange}
                          name="name"
                        />
                        {game.password && (
                          <div>
                            <label id="front-page">Enter the password:</label>
                            <input
                              type="text"
                              onChange={this.handleChange}
                              name="password"
                            />
                          </div>
                        )}
                        <button
                          className="waves-effect waves-light btn join"
                          disabled={
                            this.state.password !== game.password ||
                            !this.state.name
                          }
                        >
                          Join Game
                        </button>
                      </form>
                    </div>
                  );
                })}{" "}
              </div>
            ) : (
              <div id="roomTitle"> No active games </div>
            )}
          </div>

          <div className="col s10">
            <div className="center-align">
              <h1 id="header">MAFIA</h1>

              <h2> Join if you dare. </h2>

              <Link to={"/createGame"}>
                <button className="waves-effect waves-light btn">
                  Create A New Game
                </button>
              </Link>
              <Modal trigger={<Button waves="light">Rules</Button>}>
                <p id="rules">
                  Mafia is a thrilling game of whodunit... <br />
                  <br />
                  In this game of Mafia the computer will serve as the role of
                  moderator, or ‘God’ as they are often known - assigning roles
                  to players, taking votes and sharing information to all
                  players.
                  <br />
                  <br />
                  The Roles:
                  <br />
                  <br />MAFIA: <br />Lead Mafia - you are head of the Mafia,
                  every round you will submit who the Mafia have chosen to kill.{" "}
                  <br />Mafia - you are a part of the Mafia and will decide on
                  who to kill along with the Lead Mafia.<br />
                  <br /> VILLAGERS: <br />Doctor - every round you will be given
                  the chance to ‘save’ one person you think the Mafia are about
                  to kill. <br /> Detective - every round you will be given the
                  chance to guess who you think is Mafia, and find out if you
                  are right or wrong. <br />Civilian - you are a plain ol’
                  villager.
                  <br />
                  <br />Each round will consist of a ‘Night’ and a ‘Day’. <br />
                  <br />During the Night... <br />...roles will be assigned{" "}
                  <br />...Mafia will be able to chat privately over video and
                  decide on who to kill. Lead Mafia will then submit the name of
                  the chosen person <br />...Detective will vote for who they
                  think is Mafia and told if they are correct or not <br />...Doctor
                  will choose someone to save - if the Doctor chooses the same
                  person as the Mafia tried to kill, the ‘saved’ person will not
                  die. <br /> ...Civilians - sit tight, do nothing! <br />{" "}
                  <br /> During the Day... <br />...you will receive the
                  information about what happened during the night - who the
                  Mafia killed/who was saved. You will then discuss these
                  happenings and try to decide on who you think is the Mafia in
                  the group. The computer will then prompt everyone to vote for
                  who they think is the Mafia. Once all votes are in, you will
                  find out if you were correct or not and the person who
                  received the most votes will be out of the game. In the event
                  of a tie, the all-knowing computer will break the tie. <br />
                  <br />The game ends when there are no Mafia left (Villagers
                  win) or when the mafia have killed off all other players
                  (Mafia win).
                </p>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapState = ({ games }) => ({ games });

const mapDispatch = (dispatch, ownProps) => {
  return {
    getGames: () => {
      dispatch(fetchGames());
    },
    handleSubmit(evt, gameId) {
      evt.preventDefault();
      const name = evt.target.name.value;
      dispatch(joinExistingGame(gameId, name, ownProps.history));
    }
  };
};

export default connect(mapState, mapDispatch)(Home);

/* PROP TYPES */
Home.propTypes = {
  games: PropTypes.array,
  getGames: PropTypes.func,
  handleSubmit: PropTypes.func
};
