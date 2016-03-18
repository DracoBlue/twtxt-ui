/** @jsx React.DOM */

var React = require('react');

module.exports = User = React.createClass({
  unfollowUser: function(e) {
    e.preventDefault();

    this.props.onUnfollowUser(this.props.user.url);
  },

  render: function(){
    var user = this.props.user;
  // FIXME: add the time here?
    return (
      <li className={"tweet active"}>
        <blockquote>
          <cite>
            <a href={user.url}>@{user.nick}</a>
            <span className="screen-name">{user.displayTime}</span>
          </cite>
          <span className="content">
          {user.url} <a href="#top" className="button unfollow" onClick={this.unfollowUser}>unfollow</a>
            </span>
        </blockquote>
      </li>
    )
  }
});