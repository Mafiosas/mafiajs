import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchFacts } from "../store";

class DarkCiv extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getFacts();
  }
  render() {
    const { facts, count } = this.props;
    //PASS DOWN COUNT OF DARK THROUGH PROPS
    return (
      <div className="container">
        <p>{facts[count]}</p>
      </div>
    );
  }
}

//have a countdown related to the setTimeout?

const mapState = ({ facts }) => ({ facts });

const mapDispatch = dispatch => {
  return {
    getFacts() {
      dispatch(fetchFacts());
    }
  };
};

export default connect(mapState, mapDispatch)(DarkCiv);

//prop types
GameRoom.propTypes = {
  facts: PropTypes.array,
  fetchFacts: PropTypes.func
};
