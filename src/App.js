import React, { Component } from 'react';
import netlifyIdentity from "netlify-identity-widget"

import './App.css';
class SlackMessage extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, text: undefined, error: null, success: false };
  }
  handleText = (e) => {
    this.setState({ text: e.target.value });
  };

  generateHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (netlifyIdentity.currentUser()) {
      return netlifyIdentity.currentUser().jwt().then((token) => {
        return { ...headers, Authorization: `Bearer ${token}` };
      })
    }
    return Promise.resolve(headers);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    this.generateHeaders().then((headers) => {
      console.log("Headers are", headers)
      fetch('/.netlify/functions/slack', {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: this.state.text
        })
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(err => { throw (err) });
          }
        })
        .then(() => this.setState({ loading: false, text: null, success: true, error: null }))
        .catch(err => this.setState({ loading: false, success: false, error: err.toString() }));
    });
  }
  render() {
    const { loading, text, error, success } = this.state;
    return <form onSubmit={this.handleSubmit}>
      {error && <p><strong>Error sending message: {error}</strong></p>}
      {success && <p><strong>Done! Message sent to Slack</strong></p>}
      <p>
        <label>Your Message: <br />
          <textarea onChange={this.handleText} value={text}></textarea>
        </label>
      </p>
      <p>
        <button type="submit" disabled={loading}>{loading ? "Sending Slack Message..." : "Send a Slack Message"}</button>
      </p>
    </form>;
  }
}
class App extends Component {
  componentDidMount() {
    netlifyIdentity.init();
  }
  handleIdentity = (e) => {
    e.preventDefault();
    netlifyIdentity.open();
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Slack Messenger</h1>
        </header>
        <button onClick={this.handleIdentity}>User Status</button>
        <SlackMessage />
      </div>
    );
  }
}
export default App;