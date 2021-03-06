/** @jsx React.DOM */

var React = require('react');
var urlUtils = require('url');

module.exports = Tweet = React.createClass({
  render: function(){
    var tweet = this.props.tweet;

    var maxCount = 100;
    var isMe = false;

    /* FIXME: get this method out of this js file */
    var getPartsOfTweetByRawText = function(body) {
      var text = body.trim();
      var parts = [];

      if (text.substr(0, 4) == "/me ") {
        parts.push({"text": tweet.author, type: "me"});
        text = text.substr(4);
        isMe = true;
      }

      if (text.substr(0, 8) == "/follow ") {
        var commandParts = text.split(" ");
        parts.push({"text": tweet.author, type: "me"});
        isMe = true;
        text = "is now following @<" + commandParts[1] + " " + commandParts[2] + ">.";
      }

      if (text.substr(0, 10) == "/unfollow ") {
        var commandParts = text.split(" ");
        parts.push({"text": tweet.author, type: "me"});
        isMe = true;
        text = "is not following @" + commandParts[1] + " anymore.";
      }

      if (text.substr(0, 6) == "/nick ") {
        var commandParts = text.split(" ");
        parts.push({"text": tweet.author, type: "me"});
        isMe = true;
        text = "set the nick to " + commandParts[1] + "";
      }

      if (text.substr(0, 8) == "/twturl ") {
        var commandParts = text.split(" ");
        parts.push({"text": tweet.author, type: "me"});
        isMe = true;
        text = "set the twturl to " + commandParts[1] + "";
      }

      while (text.length > 0 || maxCount == 0)
      {
        var isMatch = false;

        var currentMatch = text.match(/^@<([^ ]+) ([^> ]+)>/);
        if (currentMatch) {
          var username = currentMatch[1];
          var twtxtUrl = currentMatch[2];
          isMatch = true;
          text = text.replace(currentMatch[0], "");
          parts.push({"text": "@" + username, username: username, twtxtUrl:twtxtUrl, "type": "mention"});
        }

        currentMatch = text.match(/^@<([^> ]+)>/);
        if (!isMatch && currentMatch) {
          var username = urlUtils.parse(currentMatch[1])['hostname'] || currentMatch[1];
          var twtxtUrl = currentMatch[1];
          text = text.replace(currentMatch[0], "");
          parts.push({"text": "@" + username, username: username, twtxtUrl:twtxtUrl, "type": "mention"});
          isMatch = true;
        }

        currentMatch = text.match(/^(http|https)(:\/\/[^\s<>"']+)/);

        if (!isMatch && currentMatch) {
          var url = currentMatch[1] + currentMatch[2];
          isMatch = true;
          text = text.replace(/^(http|https)(:\/\/[^\s<>"']+)/, '');
          parts.push({"text": url, "type": "url", url: url});
        }

        if (!isMatch) {
          currentMatch = text.match(/^([^\s]+)/);

          if (currentMatch) {
            if (parts.length > 0 && parts[parts.length - 1].type == "text") {
              parts[parts.length - 1].text = parts[parts.length - 1].text + " " + currentMatch[1];
            } else {
              parts.push({"text": currentMatch[1], "type": "text"});
            }
            text = text.replace(currentMatch[0], "");
          }
        }

        text = text.trim();
        maxCount--;
      }

      return parts;
    };

    var parts = getPartsOfTweetByRawText(tweet.rawText);

    var content = parts.map(function(part){
      if (part.type == "me") {
        return (
          <span className="me">{part.text}</span>
        )
      }
      if (part.type == "url") {
        return (
          <a href={part.url} className="external-link">{part.url}</a>
        )
      }
      if (part.type == "mention") {
        return (
          <a href={part.twtxtUrl} className="username">@{part.username}</a>
        )
      }
      return (
        <span className="text">{part.text}</span>
      )
    });

    return (
      <li className={"tweet" + (tweet.active ? ' active' : '')}>
        <img src={tweet.avatar} className="avatar"/>
        <blockquote>
          <cite>
            <a href={tweet.author_url}>{tweet.author}</a>
            <span className="screen-name">{tweet.displayTime}</span>
          </cite>
          <span className={"content"  + (isMe ? ' me' : '')}>{content}</span>
        </blockquote>
      </li>
    )
  }
});