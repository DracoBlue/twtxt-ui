/** @jsx React.DOM */

var React = require('react');

module.exports = Footer = React.createClass({

  render: function(){
    return (
      <footer className={"show-" + this.props.tab}>
            <a href="#top" className="tab config" onClick={this.props.onConfigTab}>Login</a>
            <a href="#top" className="tab following" onClick={this.props.onFollowingTab}>Following ({this.props.following.length})</a>
            <a href="#top" className="tab timeline" onClick={this.props.onTimelineTab}>Timeline  ({this.props.timeline_count})</a>
            <a href="#top" className="tab mentions" onClick={this.props.onMentionsTab}>Mentions ({this.props.mentions_count})</a>

        <br/>
        <span className={"notifications-toggle is-" + this.props.notificationsActivated}>Notifications: <a href="#top" onClick={this.props.onNotificationsToggle}>{this.props.notificationsActivated}</a> | </span> Copyright 2016 by <a className="external-link" href="https://dracoblue.net">DracoBlue</a> (<a className="external-link" href="https://github.com/DracoBlue/twtxt-ui">source</a>)
      </footer>
    )
  }
});