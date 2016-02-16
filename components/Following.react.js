/** @jsx React.DOM */

var React = require('react');
var User = require('./User.react.js');
var AddTweet = require('./AddTweet/AddTweet.react.js');


module.exports = Following = React.createClass({

  // Render our tweets
  render: function(){
    var that = this;

    // Build list items of single tweet components using map
    var content = this.props.following.map(function(user){
      return (
        <User key={user.url} user={user} onUnfollowUser={that.props.onUnfollowUser}/>
      )
    });

    // Return ul filled with our mapped tweets
    return (
      <ul className="following tweets users">
        <AddTweet onFollowUser={this.props.onFollowUser}/>
{content}</ul>
    )

  }

}); 