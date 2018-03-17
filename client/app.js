import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Home from "./components/Home.jsx";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.tokboxsession = this.tokboxsession.bind(this);
  }

  componentDidMount() {
    this.tokboxsession();
  }

  tokboxsession() {
    const apiKey = "46081452";
    const sessionId =
      "1_MX40NjA4MTQ1Mn5-MTUyMTMwMTE2MTM3MH5WMnZOSFpyeThpMEZPZUk5OFltbzgwZzF-fg";
    const token =
      "T1==cGFydG5lcl9pZD00NjA4MTQ1MiZzaWc9Nzg4ZmU3YjJlMDc1NjA0MDhjNzNkNDcxZTc3NGYxNmE1MGI5MjQxNTpzZXNzaW9uX2lkPTFfTVg0ME5qQTRNVFExTW41LU1UVXlNVE13TVRFMk1UTTNNSDVXTW5aT1NGcHllVGhwTUVaUFpVazVPRmx0Ynpnd1p6Ri1mZyZjcmVhdGVfdGltZT0xNTIxMzAxMTk0Jm5vbmNlPTAuMDI1NDU1NTg3Nzg4Nzc2OTkmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTUyMTMyMjc5MyZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ==";

    // (optional) add server code here
    initializeSession();

    // Handling all of our errors here by alerting them
    function handleError(error) {
      if (error) {
        alert(error.message);
      }
    }

    function initializeSession() {
      var session = OT.initSession(apiKey, sessionId);

      // Subscribe to a newly created stream

      session.on("streamCreated", function(event) {
        session.subscribe(
          event.stream,
          "subscriber",
          {
            insertMode: "append",
            width: "250px",
            height: "250px"
          },
          handleError
        );
      });

      // Create a publisher
      var publisher = OT.initPublisher(
        "publisher",
        {
          insertMode: "append",
          width: "250px",
          height: "250px"
        },
        handleError
      );

      // Connect to the session
      session.connect(token, function(error) {
        // If the connection is successful, publish to the session
        if (error) {
          handleError(error);
        } else {
          session.publish(publisher, handleError);
        }
      });
    }
  }
  render() {
    return (
      <div>
        <div id="videos">
          <div id="subscriber" />
          <div id="publisher" />
        </div>
        <Router>
          <Route component={Home} />
        </Router>
      </div>
    );
  }
}
