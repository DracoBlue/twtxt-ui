var http = require('http');
var url = require('url');

var GithubStore = function(token, login) {
  this.token = token;
  this.login = login;
};

GithubStore.prototype.fetchTwtxtTxt = function(cb) {
  var that = this;

  http.get("https://api.github.com/repos/" + encodeURIComponent(that.login) + "/" + encodeURIComponent(that.login) + ".github.io/contents/twtxt.txt?access_token=" + encodeURIComponent(that.token), function(res) {

    var body = [];
    res.on('data', function(chunk) {
      body.push(chunk);
    }).on('end', function() {
      body = JSON.parse(body.join(""));

      if (body.encoding == "base64") {
        cb(false, atob(body.content), body);
      } else {
        cb(true, "Only base64 encoding is supported (" + body.encoding + " given)");
      }
    });

  }).on('error', function (e) {
      console.log('error', e);
      cb(true);
    }
  );
};

GithubStore.prototype.getMetaData = function(cb) {
  var that = this;

  var filterFollowerByNick = function(followers, nick) {
    var newFollowers = [];
    followers.forEach(function(follower) {
      if (follower.nick != nick) {
        newFollowers.push(follower);
      }
    });

    return newFollowers;
  };

  this.fetchTwtxtTxt(function(err, twtxtTxtContent) {
    if (err) {
      cb(err)
    } else {
      var metaData = {
        "following": []
      };
      var lines = twtxtTxtContent.split("\n");
      lines.sort();
      lines.forEach(function(line) {
        if (line.match(/^.+\t\/[^ ]+ /)) {
          var cmd = line.match(/^.+\t\/([^ ]+) /)[1];
          if (cmd) {
            console.log("cmd", cmd);
            var firstParameterMatch = line.match(/^.+\t\/[^ ]+ ([^ ]+)/);
            if (firstParameterMatch) {
              console.log("firstParameterMatch", firstParameterMatch);
              if (cmd == "follow"|| cmd == "unfollow") {
                metaData["following"] = metaData["following"] || [];
                if (cmd == "unfollow") {
                  metaData["following"] = filterFollowerByNick(metaData["following"], firstParameterMatch[1]);
                }
                if (cmd == "follow") {

                  var secondParameterMatch = line.match(/^.+\t\/[^ ]+ [^ ]+ ([^ ]+)/);
                  console.log("secondParameterMatch", secondParameterMatch);
                  if (secondParameterMatch) {
                    metaData["following"] = filterFollowerByNick(metaData["following"], firstParameterMatch[1]);
                    metaData["following"].push({
                      "nick": firstParameterMatch[1],
                      "url": secondParameterMatch[1]
                    })
                  }
                }
              } else if (cmd == "me") {
                /* ignore */
              } else {
                metaData[cmd] = firstParameterMatch[1];
              }
            }
          }
        }
      });
      cb(false, metaData);
    }
  });
};

GithubStore.prototype.followUser = function(nick, url, cb) {
  var that = this;

  this.postMessage("/follow " + nick + " " + url, cb);
};

GithubStore.prototype.unfollowUser = function(url, cb) {
  var that = this;

  this.modifyTwtxtTxt(function(currentContent) {
    var newContent = [];
    currentContent.split("\n").forEach(function(line) {
      if (line.match(/^.+\t\/[^ ]+ /)) {
        console.log('line match', line);
        var cmd = line.match(/^.+\t\/([^ ]+) /)[1];
        if (cmd == "follow") {
          var secondParameterMatch = line.match(/^.+\t\/[^ ]+ [^ ]+ ([^ ]+)/);
          if (secondParameterMatch) {
            if (secondParameterMatch[1] == url) {
              /* skip /follow nick url entry in newContent!*/
              return ;
            }
          }
        }
      }

      newContent.push(line);
    });

    return newContent.join("\n");
  }, cb);
};

GithubStore.prototype.postMessage = function(text, cb) {
  var that = this;

  this.modifyTwtxtTxt(function(currentContent) {
    return currentContent + "\n" + (new Date().toISOString()) + "\t" + text;
  }, cb);
};

GithubStore.prototype.modifyTwtxtTxt = function(modifyCallback, cb) {
  var that = this;

  this.fetchTwtxtTxt(function(err, currentContent, currentBody) {
    var options = url.parse("https://api.github.com/repos/" + encodeURIComponent(that.login) + "/" + encodeURIComponent(that.login) + ".github.io/contents/twtxt.txt?access_token=" + encodeURIComponent(that.token));
    options.method = "PUT";
    var request = http.request(options, function(res) {

      var body = [];
      res.on('data', function(chunk) {
        body.push(chunk);
      }).on('end', function() {
        body = JSON.parse(body.join(""));
        cb(false);
      });

    }).on('error', function (e) {
        console.log('error', e);
        cb(true);
      }
    );

    var newContent = modifyCallback(currentContent);

    request.write(JSON.stringify({
      "message": "updated twtxt.txt",
      "content": btoa(newContent),
      "sha": currentBody.sha
    }));
    request.end();
  });
};


module.exports = GithubStore;

