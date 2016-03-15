/** @jsx React.DOM */

var React = require('react');

module.exports = GithubLogin = React.createClass({

  getInitialState: function() {
    return {};
  },
  render: function() {
    return (
      <li className="active tweet follow-form">
        <form action="/login/github">
          <legend>Login with Github</legend>
          <p>Use(/Create) <strong>USERNAME</strong>.github.io/<strong>twtxt.txt</strong>, to store your twtxt posts.</p>
          <input type="submit" className="button" value="Login with Github" />
        </form>
      </li>
    );
  }
});