/** @jsx React.DOM */

var React = require('react');

module.exports = Tweet = React.createClass({
  render: function(){
    var tweet = this.props.tweet;
  // FIXME: add the time here?
    return (
      <li className={"tweet" + (tweet.active ? ' active' : '')}>
        <img src={tweet.avatar} className="avatar"/>
        <blockquote>
          <cite>
            <a href={tweet.author_url}>{tweet.author}</a>
            <span className="screen-name">{tweet.displayTime}</span>
          </cite>
          <span className="content">{tweet.body}</span>
        </blockquote>
      </li>
    )
  }
});