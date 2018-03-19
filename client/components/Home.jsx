import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { fetchGames } from "../store";

class Home extends Component {
  componentDidMount() {
    this.props.getGames();
  }
  render() {
    const { games } = this.props;
    return (
      <div>
        <h1> Join if you dare. </h1>
        <div id="sidebar">
          {games.length ? (
            games.map(game => {
              return (
                <div className="rooms" key={game.id}>
                  <h3>{game.roomName}</h3>
                  <Link to={`/game/${game.id}`}>
                    <button>Join game</button>
                  </Link>
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

const mapDispatch = dispatch => {
  return {
    getGames: () => {
      dispatch(fetchGames());
    }
  };
};

export default connect(mapState, mapDispatch)(Home);
