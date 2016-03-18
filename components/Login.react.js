/** @jsx React.DOM */

var React = require('react');
var User = require('./User.react.js');
var ReadOnlyLogin = require('./Login/ReadOnlyLogin.react.js');
var GithubLogin = require('./Login/GithubLogin.react.js');


module.exports = Login = React.createClass({

  // Render our tweets
  render: function(){
    var that = this;

    if (this.props.enableGithub) {
      return (
        <ul className="login tweets users">
          <ReadOnlyLogin onChangeLogin={this.props.onChangeLogin}/>
          <GithubLogin/>
        </ul>
      )

    } else {
      return (
        <ul className="login tweets users">
          <Login onChangeLogin={this.props.onChangeLogin}/>
        </ul>
      )
    }
  }

}); 