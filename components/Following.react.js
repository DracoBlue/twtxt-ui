/** @jsx React.DOM */

var React = require('react');
var User = require('./User.react.js');

module.exports = Following = React.createClass({

  unfollow: function(url) {
    alert('unfollow' + url);
  },

  // Render our tweets
  render: function(){

    // Build list items of single tweet components using map
    var content = this.props.following.map(function(user){
      return (
        <User key={user.url} user={user} />
      )
    });

    // Return ul filled with our mapped tweets
    return (
      <ul className="following tweets users">{content}</ul>
    )

  }

}); 