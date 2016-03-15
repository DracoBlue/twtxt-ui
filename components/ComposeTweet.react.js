/** @jsx React.DOM */

var React = require('react');

module.exports = ComposeTweet = React.createClass({

  getInitialState: function() {
    return {text: ''};
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },

  handleSubmit: function(e) {
    e.preventDefault();

    var text = this.state.text.trim();
    if (!text) {
      return;
    }

    this.props.onPostMessage(text);
    this.setState({text: ''});
  },

  render: function() {
    return (
      <li className="active tweet follow-form">
      <form onSubmit={this.handleSubmit}>
        <legend>Post message</legend>
        <input
          className="text-field"
          type="text"
          placeholder="Text (e.g. Hello World!)"
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <input type="submit" className="button" value="Send" />
      </form>
        </li>
    );
  }
});