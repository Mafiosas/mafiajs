import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { joinExistingGame } from "../store";

class Home extends Component {
  render() {
    const { games } = this.props;
    return (
      <div>
        <h1> Join if you dare. </h1>
        <div id="sidebar">
          {games.length ? (
            games.map(game => {
              return (
                <div class="rooms" key={game.id}>
                  {game.name}
                  <Link to={`/game/${game.id}`}>
                    <button>Join game</button>
                  </Link>
                </div>
              );
            })
          ) : (
            <div> No actives games </div>
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

const mapDispatch = null;

export default connect(mapState, mapDispatch)(Home);
