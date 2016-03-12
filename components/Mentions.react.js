/** @jsx React.DOM */

var React = require('react');
var Tweet = require('./Tweet.react.js');

module.exports = Mentions = React.createClass({

  // Render our tweets
  render: function(){

    // Build list items of single tweet components using map
    var content = this.props.tweets.map(function(tweet){
      return (
        <Tweet key={"mention-" + tweet.id} tweet={tweet} />
      )
    });

    // Return ul filled with our mapped tweets
    return (
      <ul className="mentions tweets">{content}</ul>
    )

  }

}); 