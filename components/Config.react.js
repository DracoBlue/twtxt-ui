/** @jsx React.DOM */

var React = require('react');
var User = require('./User.react.js');
var Login = require('./Login/Login.react.js');
var GithubLogin = require('./Login/GithubLogin.react.js');


module.exports = Config = React.createClass({

  // Render our tweets
  render: function(){
    var that = this;

    if (this.props.enableGithub) {
      return (
        <ul className="config tweets users">
          <Login onChangeLogin={this.props.onChangeLogin}/>
          <GithubLogin/>
        </ul>
      )

    } else {
      return (
        <ul className="config tweets users">
          <Login onChangeLogin={this.props.onChangeLogin}/>
        </ul>
      )
    }
  }

}); 