/** @jsx React.DOM */

var React = require('react');
var Tweet = require('./Tweet.react.js');
var ComposeTweet = require('./ComposeTweet.react.js');

module.exports = Tweets = React.createClass({

  // Render our tweets
  render: function(){

    // Build list items of single tweet components using map
    var content = this.props.tweets.map(function(tweet){
      return (
        <Tweet key={"tweet-" + tweet.id} tweet={tweet} />
      )
    });

    if (this.props.canPost) {
      content.unshift((<ComposeTweet onPostMessage={this.props.onPostMessage}/>));
    }

    // Return ul filled with our mapped tweets
    return (
      <ul className="timeline tweets">{content}</ul>
    )

  }

}); 