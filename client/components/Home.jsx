import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { fetchGames, joinExistingGame } from "../store";

class Home extends Component {
  componentDidMount() {
    this.props.getGames();
  }
  render() {
    const { games, handleSubmit } = this.props;
    return (
      <div>
        <h1> Join if you dare. </h1>
        <div id="sidebar">
          {games.length ? (
            games.map(game => {
              return (
                <div className="rooms" key={game.id}>
                  <h3>{game.roomName}</h3>
                  <form onSubmit={event => handleSubmit(event, game.id)}>
                    <input name="name" placeholder="enter your first name" />
                    <button>Join Game</button>
                  </form>
                </div>
              );
            })
          ) : (
            <div> No active games </div>
          )}
        </div>
        <Link to={"/createGame"}>
          <button>Create A New Game</button>
        </Link>
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
