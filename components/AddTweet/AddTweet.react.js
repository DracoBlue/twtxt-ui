/** @jsx React.DOM */

var React = require('react');

module.exports = AddTweet = React.createClass({

  getInitialState: function() {
    return {nick: '', url: ''};
  },
  handleNicknameChange: function(e) {
    this.setState({nick: e.target.value});
  },
  handleUrlChange: function(e) {
    this.setState({url: e.target.value});
  },

  handleSubmit: function(e) {
    e.preventDefault();

    var nick = this.state.nick.trim();
    var url = this.state.url.trim();
    if (!url || !nick) {
      return;
    }

    this.props.onFollowUser(nick, url);

    // TODO: send request to the server
    this.setState({nick: '', url: ''});
  },

  render: function() {
    return (
      <li className="active tweet follow-form">
      <form onSubmit={this.handleSubmit}>
        <legend>Add User</legend>
        <input
          className="text-field"
          type="text"
          placeholder="Nickname (e.g. example)"
          value={this.state.nick}
          onChange={this.handleNicknameChange}
        />
        <input
          className="text-field"
          type="text"
          placeholder="Url (e.g. http://example.org/twtxt.txt)"
          value={this.state.url}
          onChange={this.handleUrlChange}
        />
        <input type="submit" className="button" value="Follow User" />
      </form>
        </li>
    );
  }
});