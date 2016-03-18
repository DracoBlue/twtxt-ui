/** @jsx React.DOM */

var React = require('react');

module.exports = Footer = React.createClass({

  render: function(){
    var timelineCountInfo = "";
    var mentionsCountInfo = "";

    if (this.props.timeline_count) {
      timelineCountInfo = "(" + this.props.timeline_count + ")";
    }

    if (this.props.mentions_count) {
      mentionsCountInfo = "(" + this.props.mentions_count + ")";
    }

    return (
      <footer className={"show-" + this.props.tab}>
            <a href="#top" className="tab timeline" onClick={this.props.onTimelineTab}>Timeline {timelineCountInfo}</a>
            <a href="#top" className="tab mentions" onClick={this.props.onMentionsTab}>Mentions {mentionsCountInfo}</a>
            <a href="#top" className="tab following" onClick={this.props.onFollowingTab}>Following ({this.props.following.length})</a>
            <a href="/" className="tab logout">Logout</a>

        <br/>
        <span className={"notifications-toggle is-" + this.props.notificationsActivated}>Notifications: <a href="#top" onClick={this.props.onNotificationsToggle}>{this.props.notificationsActivated}</a> | </span> Copyright 2016 by <a className="external-link" href="https://dracoblue.net">DracoBlue</a> (<a className="external-link" href="https://github.com/DracoBlue/twtxt-ui">source</a>)
      </footer>
    )
  }
});