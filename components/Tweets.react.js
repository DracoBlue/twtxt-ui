/** @jsx React.DOM */

var React = require('react');
var Tweet = require('./Tweet.react.js');
var ComposeTweet = require('./ComposeTweet.react.js');
var moment = require('moment');

module.exports = Tweets = React.createClass({

  // Render our tweets
  render: function(){

    // Build list items of single tweet components using map
    var content = this.props.tweets.map(function(tweet){
      return (
        <Tweet key={"tweet-" + tweet.id} tweet={tweet} />
      )
    });

    if (this.props.tweets.length == 0) {
      var tweet = {
        "author": "system",
        "active": true,
        "author_url": "http://web.twtxt.org/twtxt.txt",
        timestamp: moment(),
        displayTime: moment().format('YYYY/MM/DD HH:mm'),
        "text": "You will see all tweets here, but nobody who you follow has posted anything, yet.",
        "rawText": "You will see all tweets here, but nobody who you follow has posted anything, yet."
      };

      content = [(
        <Tweet key={"tweet-no-tweet"} tweet={tweet} />
      )];
    }

    if (this.props.canPost) {
      content.unshift((<ComposeTweet onPostMessage={this.props.onPostMessage}/>));
    }

    // Return ul filled with our mapped tweets
    return (
      <ul className="timeline tweets">{content}</ul>
    )

  }

}); 