var moment = require('moment');
var store = require('store');
var md5 = require('md5');
var urlUtils = require('url');
var http = require('http');

var TweetFetcher = function() {

};

TweetFetcher.prototype.login = function(url, nick) {
  store.set('url', url);
  if (nick) {
    store.set('nick', nick);
  }
};

TweetFetcher.prototype.follow = function(nick, url) {
  var that = this;
  var following = [];

  store.get('following').forEach(function(user) {
    following.push(user);
  });

  following.push({
    "nick": nick,
    "url": url
  });

  following.sort(function(a, b) {
    if (a.nick == b.nick) {
      return 0;
    }
    return a.nick > b.nick ? -1 : 1;
  });

  store.set('following', following);

  if (this.onUpdatedFollowing) {
    setTimeout(function() {
      that.onUpdatedFollowing(following);
    });
  }
};

TweetFetcher.prototype.unfollow = function(nickOrUrl) {
  var that = this;
  var following = [];

  store.get('following').forEach(function(user) {
    if (user.nick != nickOrUrl && user.url != nickOrUrl) {
      following.push(user);
    }
  });

  store.set('following', following);

  if (this.onUpdatedFollowing) {
    setTimeout(function() {
      that.onUpdatedFollowing(following);
    });
  }
};

TweetFetcher.prototype.initializeTweetsTimer = function() {
  var that = this;

  setInterval(function() {
    that.fetchAll(function(tweets) {
      that.onNewTweets(tweets);
    });
  }, 2 * 60000);
};

TweetFetcher.prototype.initializeMentionsTimer = function() {
  var that = this;

  setInterval(function() {
    that.fetchAllMentions(function(tweets) {
      that.onNewMentions(tweets);
    });
  }, 2 * 60000);
};

TweetFetcher.prototype.fetchAllMentions = function(cb) {
  var that = this;

  var tweets = [];

  var url = store.get('url') || 'https://buckket.org/twtxt.txt';

  http.get("https://registry.twtxt.org/api/plain/mentions?url=" + encodeURIComponent(url), function(res) {

    var body = [];
    res.on('data', function(chunk) {
      body.push(chunk);
    }).on('end', function() {
      body = body.join("");

      that.parseRawMentions(body).forEach(function(tweet) {
        tweets.push(tweet);
      });

      cb(tweets);
    });

  }).on('error', function (e) {
      cb([]);
    }
  );
};

TweetFetcher.prototype.fetchAllFollowing = function(cb) {
  var that = this;

  var users = [];

  store.get('following').forEach(function(user) {
    user.unfollow = function() {
      that.unfollow(user.url);
    };
    users.push(user);
  });

  users.sort(function(a, b) {
    if (a.nick == b.nick) {
      return 0;
    }
    return a.nick > b.nick ? -1 : 1;
  });

  cb(users);
};

TweetFetcher.prototype.fetchAll = function(cb) {
  var that = this;

  var itemsLeft = store.get('following').length;
  var tweets = [];

  store.get('following').forEach(function(user) {
    var url = user.url;


    http.get("/api/fetchTwTxt?limit=20&url=" + encodeURIComponent(url), function(res) {

      var body = [];
      res.on('data', function(chunk) {
        body.push(chunk);
      }).on('end', function() {
        body = body.join("");
        itemsLeft -= 1;

        that.parseRawTweets(user.nick, url, body).forEach(function(tweet) {
          tweets.push(tweet);
        });

        if (!itemsLeft) {
          cb(tweets);
        }
      });

      }).on('error', function (e) {
        itemsLeft -= 1;

        if (!itemsLeft) {
          cb(tweets);
        }
      }
    );
  });
};

TweetFetcher.prototype.notifyOnNewTweets = function(cb) {
  this.initializeTweetsTimer();
  this.onNewTweets = cb;
};

TweetFetcher.prototype.notifyOnNewMentions = function(cb) {
  this.initializeMentionsTimer();
  this.onNewMentions = cb;
};

TweetFetcher.prototype.notifyOnUpdatedFollowing = function(cb) {
  this.onUpdatedFollowing = cb;
};

var xml_special_to_escaped_one_map = {
  '&': '&',
  '"': '"',
  '<': '&lt;',
  '>': '&gt;'
};

var escaped_one_to_xml_special_map = {
  '&': '&',
  '"': '"',
  '&lt;': '<',
  '&gt;': '>'
};

TweetFetcher.prototype.encodeXml = function(string) {
  return string.replace(/([\&"<>])/g, function(str, item) {
    return xml_special_to_escaped_one_map[item];
  });
};

TweetFetcher.prototype.decodeXml = function(string) {
  return string.replace(/("|<|>|&)/g,
    function(str, item) {
      return escaped_one_to_xml_special_map[item];
    });
};

TweetFetcher.prototype.parseRawTweets = function(nick, url, rawTweets) {
  var that = this;
  var tweets = [];

  rawTweets.split("\n").forEach(function(row) {
    row = (row || "").trim();

    if (row) {
      var match = row.match(/^([^\t]+)\t(.+)/);

      if (match && moment(match[1]).isValid()) {

        var body = match[2].trim();
        var rawText = body;

        var text = body.replace(/(<[^>]+>)/g, '');

        tweets.push({
          id: md5(url + "\t" + row),
          timestamp: moment(match[1]),
          displayTime: moment(match[1]).format('YYYY/MM/DD HH:mm'),
          author: nick,
          author_url: url,
          text: text,
          rawText: rawText
        });
      }
    }
  });

  tweets.sort(function(a, b) {
    if (a.timestamp.unix() == b.timestamp.unix()) {
      return 0;
    }
    return a.timestamp.unix() > b.timestamp.unix() ? -1 : 1;
  });

  /* limit to the latest 20 entries */
  tweets = tweets.slice(0, 20);

  return tweets;
};

TweetFetcher.prototype.parseRawMentions = function(rawTweets) {
  var that = this;
  var tweets = [];

  var idsInUse = {};

  rawTweets.split("\n").forEach(function(row) {
    row = (row || "").trim();

    if (row) {
      var match = row.match(/^([^\t]+)\t([^\t]+)\t([^\t]+)\t(.+)/);

      if (match && moment(match[3]).isValid()) {
        var body = match[4].trim();
        var rawText = body;

        var text = body.replace(/(<[^>]+>)/g, '');

        var id = md5(row);

        if (idsInUse[id]) {
          return ;
        }

        idsInUse[id] = true;

        tweets.push({
          id: id,
          timestamp: moment(match[3]),
          displayTime: moment(match[3]).format('YYYY/MM/DD HH:mm'),
          author: match[1],
          author_url: match[2],
          text: text,
          rawText: rawText
        });
      }
    }
  });

  return tweets;
};

module.exports = TweetFetcher;

