/** @jsx React.DOM */

var React = require('react');
var store = require('store');

module.exports = ReadOnlyLogin = React.createClass({

  getInitialState: function() {
    return {url: store.get('url') || "https://buckket.org/twtxt.txt"};
  },
  handleUrlChange: function(e) {
    this.setState({url: e.target.value});
  },

  handleSubmit: function(e) {
    e.preventDefault();

    var url = this.state.url.trim();
    if (!url) {
      return;
    }

    this.props.onChangeLogin(url);

    this.setState({url: url});
  },

  render: function() {
    return (
      <li className="active tweet follow-form">
      <form onSubmit={this.handleSubmit}>
        <legend>(Read-Only) Login</legend>
        <input
          className="text-field"
          type="text"
          placeholder="Url (e.g. http://example.org/twtxt.txt)"
          value={this.state.url}
          onChange={this.handleUrlChange}
        />
        <input type="submit" className="button" value="Login with this Url" />
      </form>
        </li>
    );
  }
});