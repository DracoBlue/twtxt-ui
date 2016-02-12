/** @jsx React.DOM */

var React = require('react');

module.exports = Footer = React.createClass({
  render: function(){
    return (
      <footer className={"show-" + this.props.tab}>
            <a href="#top" className="timeline" onClick={this.props.onTimelineTab}>Timeline  ({this.props.timeline_count})</a> | <a href="#top" className="mentions" onClick={this.props.onMentionsTab}>Mentions ({this.props.mentions_count})</a> |  <a href="https://web.twtxt.org">web.twtxt.org</a> (<a href="https://github.com/DracoBlue/twtxt-ui">source</a>)
      </footer>
    )
  }
});