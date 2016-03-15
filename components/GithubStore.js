var http = require('http');
var url = require('url');

var GithubStore = function(token, login) {
  this.token = token;
  this.login = login;
};

GithubStore.prototype.fetchTwtxtTxt = function(cb) {
  var that = this;

  http.get("http://api.github.com/repos/" + encodeURIComponent(this.login) + "/" + encodeURIComponent(this.login) + ".github.io/contents/twtxt.txt?access_token=" + encodeURIComponent(that.token), function(res) {

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

  this.fetchTwtxtTxt(function(err, twtxtTxtContent) {
    if (err) {
      cb(err)
    } else {
      var metaData = {};
      twtxtTxtContent.split("\n").forEach(function(line) {
        if (line.match(/^.+\t\/[^ ]+ /)) {
          var cmd = line.match(/^.+\t\/([^ ]+) /)[1];
          if (cmd) {
            var firstParameterMatch = line.match(/^.+\t\/[^ ]+ ([^ ]+)/);
            if (firstParameterMatch) {
              metaData[cmd] = firstParameterMatch[1];
            }
          }
        }
      });
      cb(false, metaData);
    }
  });
};


GithubStore.prototype.postMessage = function(text, cb) {
  var that = this;

  this.fetchTwtxtTxt(function(err, currentContent, currentBody) {
    var options = url.parse("http://api.github.com/repos/" + encodeURIComponent(this.login) + "/" + encodeURIComponent(this.login) + ".github.io/contents/twtxt.txt?access_token=" + encodeURIComponent(that.token));
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

    var newContent = currentContent + "\n" + (new Date().toISOString()) + "\t" + text;

    request.write(JSON.stringify({
      "message": "posted a new message to twtxt.txt",
      "content": btoa(newContent),
      "sha": currentBody.sha
    }));
    request.end();
  });
};


module.exports = GithubStore;

