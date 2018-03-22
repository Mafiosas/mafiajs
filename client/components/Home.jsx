import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { fetchGames, joinExistingGame } from "../store";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      renderTimer: false
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.props.getGames();
  }

  handleChange(event) {
    this.setState({ password: event.target.value });
  }
  render() {
    const { games, handleSubmit } = this.props;
    return (
      <div>
        <div className="row">
          <div className="col s2" id="sidebar">
            {games.length ? (
              games.map(game => {
                return (
                  <div className="rooms" key={game.id}>
                    <h3>{game.roomName}</h3>
                    <form onSubmit={event => handleSubmit(event, game.id)}>
                      <input
                        type="text"
                        name="name"
                        placeholder="enter your first name"
                      />
                      {game.password && (
                        <input
                          type="text"
                          onChange={this.handleChange}
                          name="password"
                          placeholder="enter password"
                        />
                      )}
                      <button
                        className="waves-effect waves-light btn"
                        disabled={this.state.password !== game.password}
                      >
                        Join Game
                      </button>
                    </form>
                  </div>
                );
              })
            ) : (
              <div> No active games </div>
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapState = (state, ownProps) => {
  return {
    games: state.games
  };
};

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
