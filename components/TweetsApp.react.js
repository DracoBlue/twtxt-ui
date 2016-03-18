/** @jsx React.DOM */

var React = require('react');
var Tweets = require('./Tweets.react.js');
var Mentions = require('./Mentions.react.js');
var Following = require('./Following.react.js');
var Footer = require('./Footer.react.js');
var Loader = require('./Loader.react.js');
var Config = require('./Config.react.js');
var NotificationBar = require('./NotificationBar.react.js');
var urlUtils = require('url');
var querystring = require('querystring');
var store = require('store');
var TweetFetcher = require('./TweetFetcher.js');
var GithubStore = require('./GithubStore.js');
/* FIXME: hack, so we can use the notify lib with browserify! */
global.window = global;
var notify = require('html5-desktop-notifications');

// Export the TweetsApp component
module.exports = TweetsApp = React.createClass({

  // Method to add a tweet to our timeline
  addTweet: function(tweet){

    // Get current application state
    var updated = this.state.tweets;

    var isNew = true;

    updated.forEach(function(olderTweet) {
      if (olderTweet.id == tweet.id) {
        isNew = false;
      }
    });

    if (!isNew) {
      return ;
    }

    if (isNew && this.state.notificationsActivated == "ON") {
      window.notify.createNotification("@" + tweet.author + " says", {body: tweet.text, "icon": "/favicon.ico"});
    }

  // Increment the unread count
    var count = this.state.count + 1;

    // Increment the skip count
    var skip = this.state.skip + 1;

    // Add tweet to the beginning of the tweets array
    updated.unshift(tweet);

    updated.sort(function(a, b) {
      if (a.timestamp.unix() == b.timestamp.unix()) {
        return 0;
      }
      return a.timestamp.unix() > b.timestamp.unix() ? -1 : 1;
     });

    // Set application state
    this.setState({tweets: updated, count: count, skip: skip});

  },

  // Method to add a tweet to our mentions
  addMention: function(tweet){

    // Get current application state
    var updated = this.state.mentions;

    var isNew = true;

    updated.forEach(function(olderTweet) {
      if (olderTweet.id == tweet.id) {
        isNew = false;
      }
    });

    if (!isNew) {
      return ;
    }

    // Increment the unread count
    var count = this.state.mentions_count + 1;

    // Increment the skip count
    var skip = this.state.mentions_skip + 1;

    // Add tweet to the beginning of the tweets array
    updated.unshift(tweet);

    updated.sort(function(a, b) {
      if (a.timestamp.unix() == b.timestamp.unix()) {
        return 0;
      }
      return a.timestamp.unix() > b.timestamp.unix() ? -1 : 1;
    });

    // Set application state
    this.setState({mentions: updated, mentions_count: count, mentions_skip: skip});

  },

  // Method to get JSON from server by page
  getPage: function(page){

    // Setup our ajax request
    var request = new XMLHttpRequest(), self = this;
    request.open('GET', 'page/' + page + "/" + this.state.skip, true);
    request.onload = function() {

      // If everything is cool...
      if (request.status >= 200 && request.status < 400){

        // Load our next page
        self.loadPagedTweets(JSON.parse(request.responseText));

      } else {

        // Set application state (Not paging, paging complete)
        self.setState({paging: false, done: true});

      }
    };

    // Fire!
    request.send();

  },

  // Method to show the unread tweets
  showNewTweets: function(){

    // Get current application state
    var updated = this.state.tweets;

    // Mark our tweets active
    updated.forEach(function(tweet){
      tweet.active = true;
    });

    // Set application state (active tweets + reset unread count)
    this.setState({tweets: updated, tab: 'timeline', count: 0});

  },

  showTimelineTab: function(){
    this.setState({tab: "timeline"});
  },

  showMentionsTab: function(){
    this.setState({tab: "mentions"});
  },

  showFollowingTab: function(){
    this.setState({tab: "following"});
  },

  showConfigTab: function(){
    this.setState({tab: "config"});
  },

  // Method to load tweets fetched from the server
  loadPagedTweets: function(tweets){

    // So meta lol
    var self = this;

    // If we still have tweets...
    if(tweets.length > 0) {

      // Get current application state
      var updated = this.state.tweets;

      // Push them onto the end of the current tweets array
      tweets.forEach(function(tweet){
        updated.push(tweet);
      });

      // This app is so fast, I actually use a timeout for dramatic effect
      // Otherwise you'd never see our super sexy loader svg
      setTimeout(function(){

        // Set application state (Not paging, add tweets)
        self.setState({tweets: updated, paging: false});

      }, 1000);

    } else {

      // Set application state (Not paging, paging complete)
      this.setState({done: true, paging: false});

    }
  },

  // Method to check if more tweets should be loaded, by scroll position
  checkWindowScroll: function(){

    // Get scroll pos & window data
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var s = (document.body.scrollTop || document.documentElement.scrollTop || 0);
    var scrolled = (h + s) > document.body.offsetHeight;

    // If scrolled enough, not currently paging and not complete...
    if(scrolled && !this.state.paging && !this.state.done) {

      // Set application state (Paging, Increment page)
      this.setState({paging: true, page: this.state.page + 1});

      // Get the next page of tweets from the server
      //this.getPage(this.state.page);

    }
  },

  // Set the initial component state
  getInitialState: function(props){
    var notify = window.notify;

    props = props || this.props;

    var notificationsActivated = "NA";

    if (notify.isSupported) {
      if (notify.permissionLevel() == notify.PERMISSION_GRANTED) {
        notificationsActivated = store.get('notificationsActivated') ? "ON" : "OFF";
      } else {
        notificationsActivated = "OFF";
      }
    }

    if (!store.get('following')) {
      store.set('following', [
        {"url": 'https://buckket.org/twtxt_news.txt', "nick": "twtxt_news"},
        {"url": 'https://buckket.org/twtxt.txt', "nick": "buckket"},
        {"url": 'https://dracoblue.net/twtxt.txt', "nick": "dracoblue"}
      ]);
    }

    // Set initial application state using props
    return {
      notificationsActivated: notificationsActivated,
      tweets: [],
      mentions: [],
      following: [],
      enableGithub: props.enableGithub || false,
      tab: 'config',
      count: 0,
      mentions_count: 0,
      page: 0,
      paging: false,
      skip: 0,
      mentions_skip: 0,
      done: false
    };

  },

  componentWillReceiveProps: function(newProps, oldProps){
    this.setState(this.getInitialState(newProps));
  },

  // Called directly after component rendering, only on client
  componentDidMount: function(){

    // Preserve self reference
    var self = this;
    var that = this;

    var fetcher = new TweetFetcher();

    /* FIXME: this is available for alpha testers */
    window.fetcher = fetcher;

    this.fetcher = fetcher;

    var initializeFetcher = function() {
      fetcher.fetchAll(function(tweets) {
        var updated = that.state.tweets;

        tweets.forEach(function(tweet) {
          tweet.active = true;
          updated.push(tweet);
        });

        updated.sort(function(a, b) {
          if (a.timestamp.unix() == b.timestamp.unix()) {
            return 0;
          }
          return a.timestamp.unix() > b.timestamp.unix() ? -1 : 1;
        });

        that.setState({tweets: updated, count: 0});

        fetcher.notifyOnNewTweets(function(tweets) {
          tweets.forEach(function(tweet) {
            self.addTweet(tweet);
          })
        });
      });

      fetcher.fetchAllMentions(function(tweets) {
        var updated = that.state.mentions;

        tweets.forEach(function(tweet) {
          tweet.active = true;
          updated.push(tweet);
        });

        updated.sort(function(a, b) {
          if (a.timestamp.unix() == b.timestamp.unix()) {
            return 0;
          }
          return a.timestamp.unix() > b.timestamp.unix() ? -1 : 1;
        });

        that.setState({mentions: updated, mentions_count: 0});

        fetcher.notifyOnNewMentions(function(tweets) {
          tweets.forEach(function(tweet) {
            self.addMention(tweet);
          })
        });
      });

      fetcher.fetchAllFollowing(function(users) {
        that.setState({following: users});

        fetcher.notifyOnUpdatedFollowing(function(users) {
          that.setState({following: users});
        });
      });
    };


    if (document.location.toString().indexOf('#?') != -1) {
      var queryStringParts = querystring.parse(document.location.toString().substr(document.location.toString().indexOf('#?') + 2));
      if (queryStringParts.githubLogin && queryStringParts.githubAccessToken) {
        var githubStore = new GithubStore(queryStringParts.githubAccessToken, queryStringParts.githubLogin.toLowerCase());

        githubStore.getMetaData(function(err, metaData) {
          console.log('contents!', metaData);
          that.store = githubStore;
          that.setState({canPost: true});
          if (metaData.twtxtUrl) {
            that.fetcher.login(metaData.twtxtUrl, metaData.nick);
          } else {
            that.fetcher.login("https://" + queryStringParts.githubLogin.toLowerCase() + '.github.io/twtxt.txt', queryStringParts.githubLogin.toLowerCase());
          }
          that.showTimelineTab();

          store.set('following', metaData.following);

          initializeFetcher();
        });
      } else {
        initializeFetcher();
      }
      document.location.hash = "#top";
    } else {
      initializeFetcher();
    }

    // Attach scroll event to the window for infinity paging
    window.addEventListener('scroll', this.checkWindowScroll);

  },

  followUser: function(nick, url) {
    this.fetcher.follow(nick, url);

    if (this.store) {
      this.store.followUser(nick, url, function(err) {
      });
    }
  },

  postMessage: function(text) {
    var that = this;
    this.store.postMessage(text, function(err) {
      that.showTimelineTab();
    });
  },

  unfollowUser: function(url) {
    this.fetcher.unfollow(url);

    if (this.store) {
      this.store.unfollowUser(url, function(err) {
      });
    }
  },

  changeLogin: function(url) {
    this.fetcher.login(url);
    this.showFollowingTab();
  },

  onNotificationsToggle: function(e) {
    var notify = window.notify;

    e.preventDefault();

    if (this.state.notificationsActivated == "OFF") {
      if (notify.permissionLevel() != notify.PERMISSION_GRANTED) {
        notify.requestPermission();
      }

      if (notify.permissionLevel() != notify.PERMISSION_GRANTED) {
        this.setState({notificationsActivated: "OFF"});
        store.set('notificationsActivated', false);
      } else {
        this.setState({notificationsActivated: "ON"});
        store.set('notificationsActivated', true);
      }
    } else {
      this.setState({notificationsActivated: "OFF"});
      store.set('notificationsActivated', false);
    }
  },

  // Render the component
  render: function(){
    // <Loader paging={this.state.paging} />
    return (
      <div className={"tweets-app show-" + this.state.tab}>
        <Tweets tweets={this.state.tweets} canPost={this.state.canPost} onPostMessage={this.postMessage} />
        <Mentions tweets={this.state.mentions} />
        <Following following={this.state.following} onFollowUser={this.followUser}  onUnfollowUser={this.unfollowUser} />
        <Config onChangeLogin={this.changeLogin} enableGithub={this.state.enableGithub} />
        <NotificationBar count={this.state.count} onShowNewTweets={this.showNewTweets} />
        <Footer onNotificationsToggle={this.onNotificationsToggle} notificationsActivated={this.state.notificationsActivated} tab={this.state.tab} following={this.state.following} timeline_count={this.state.count} mentions_count={this.state.mentions_count} onTimelineTab={this.showTimelineTab} onMentionsTab={this.showMentionsTab} onFollowingTab ={this.showFollowingTab} onConfigTab ={this.showConfigTab} />
      </div>
    )

  }

});