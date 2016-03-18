/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');
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

    if (this.props.tweets.length == 0) {
      var tweet = {
        "author": "system",
        "active": true,
        "author_url": "http://web.twtxt.org/twtxt.txt",
         timestamp: moment(),
         displayTime: moment().format('YYYY/MM/DD HH:mm'),
          "text": "You will see all @mentions of your nickname here. But nobody mentioned you, yet.",
          "rawText": "You will see all @mentions of your nickname here. But nobody mentioned you, yet."
      };

      var content = (
        <Tweet key={"mention-no-tweet"} tweet={tweet} />
      );
    }

    // Return ul filled with our mapped tweets
    return (
      <ul className="mentions tweets">{content}</ul>
    )

  }

}); 