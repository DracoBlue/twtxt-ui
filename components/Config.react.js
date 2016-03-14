/** @jsx React.DOM */

var React = require('react');
var User = require('./User.react.js');
var Login = require('./Login/Login.react.js');


module.exports = Config = React.createClass({

  // Render our tweets
  render: function(){
    var that = this;

    // Return ul filled with our mapped tweets
    return (
      <ul className="config tweets users">
        <Login onChangeLogin={this.props.onChangeLogin}/>
      </ul>
    )

  }

}); 