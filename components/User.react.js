/** @jsx React.DOM */

var React = require('react');

module.exports = User = React.createClass({
  render: function(){
    var user = this.props.user;
  // FIXME: add the time here?
    return (
      <li className={"tweet" + (user.active ? ' active' : '')}>
        <blockquote>
          <cite>
            <a href={user.url}>@{user.nickname}</a>
            <span className="screen-name">{user.displayTime}</span>
          </cite>
          <span className="content">
          {user.url} <a href="#top" className="button unfollow" onClick={user.unfollow}>unfollow</a>
            </span>
        </blockquote>
      </li>
    )
  }
});