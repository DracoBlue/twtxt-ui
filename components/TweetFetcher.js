var request = require('request');
var moment = require('moment');
var store = require('store');
var md5 = require('md5');
var urlUtils = require('url');

var TweetFetcher = function() {

  if (!store.get('following')) {
    store.set('following', [
      {"url": 'https://buckket.org/twtxt_news.txt', "nickname": "twtxt_news"},
      {"url": 'https://buckket.org/twtxt.txt', "nickname": "buckket"},
      {"url": 'https://dracoblue.net/twtxt.txt', "nickname": "dracoblue"}
    ]);
  }
};

TweetFetcher.prototype.follow = function(nickname, url) {
  var following = [];

  store.get('following').forEach(function(user) {
    following.push(user);
  });

  following.push({
    "nickname": nickname,
    "url": url
  })

  store.set('following', following);
};

TweetFetcher.prototype.unfollow = function(nicknameOrUrl) {
  var following = [];

  store.get('following').forEach(function(user) {
    if (user.nickname != nicknameOrUrl && user.url != nicknameOrUrl) {
      following.push(user);
    }
  });

  store.set('following', following);
};

TweetFetcher.prototype.initializeTimer = function() {
  var that = this;

  setInterval(function() {
    that.fetchAll(function(tweets) {
      that.onNewTweets(tweets);
    });
  }, 10000);
};

TweetFetcher.prototype.fetchAll = function(cb) {
  var that = this;

  var itemsLeft = store.get('following').length;
  var tweets = [];

  store.get('following').forEach(function(user) {
    var url = user.url;

    request({
      "url": document.location.protocol + "//" + document.location.host + "/api/fetchTwTxt", "qs": {"url":url}}, function(err, response, body) {
      //console.log('err', err, 'response', response, "body", body);
      itemsLeft -= 1;

      if (!err) {
        that.parseRawTweets(user.nickname, url, body).forEach(function(tweet) {
          tweets.push(tweet);
        });
      }

      if (!itemsLeft) {
        cb(tweets);
      }

    });
  });
};

TweetFetcher.prototype.notifyOnNewTweets = function(cb) {
  this.initializeTimer();
  this.onNewTweets = cb;
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

TweetFetcher.prototype.parseRawTweets = function(nickname, url, rawTweets) {
  var that = this;
  var tweets = [];

  rawTweets.split("\n").forEach(function(row) {
    row = (row || "").trim();

    if (row) {
      var match = row.match(/^([^\t]+)\t(.+)/);

      if (match && moment(match[1]).isValid()) {

        var body = match[2].trim();
        if (body) {
          var currentMatch = body.match(/@<([^ ]+) ([^> ]+)>/);
          while (currentMatch) {
            body = body.replace(currentMatch[0], '<a href="' + that.encodeXml(currentMatch[2]) + '" class="username">@' + that.encodeXml(currentMatch[1]) + '</a>');
            currentMatch = body.match(/@<([^ ]+) ([^> ]+)>/);
          }

          currentMatch = body.match(/@<([^> ]+)>/);
          while (currentMatch) {
            body = body.replace(currentMatch[0], '<a href="' + that.encodeXml(currentMatch[1]) + '" class="username">@' + that.encodeXml(urlUtils.parse(currentMatch[1])['hostname'] || currentMatch[1]) + '</a>');
            currentMatch = body.match(/@<([^> ]+)>/);
          }
        }


        tweets.push({
          id: md5(url + "\t" + row),
          timestamp: moment(match[1]),
          displayTime: moment(match[1]).format('YYYY/MM/DD HH:mm'),
          screenname: nickname,
          author: nickname,
          author_url: url,
          body: body
        });
      }
    }
  });

  return tweets;
};


module.exports = TweetFetcher;

