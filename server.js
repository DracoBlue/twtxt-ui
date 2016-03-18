// Require our dependencies
var express = require('express'),
  exphbs = require('express-handlebars'),
  http = require('http'),
  routes = require('./routes'),
  github = require('octonode');

// Create an express instance and set a port variable
var app = express();
var port = process.env.PORT || 8080;

// Set handlebars as the templating engine
app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Disable etag headers on responses
app.disable('etag');

// Index Route
app.get('/', routes.index);

if (process.env.GITHUB_CLIENT_ID) {
  // Build the authorization config and url
  var githubAuthUrl = github.auth.config({
    id: process.env.GITHUB_CLIENT_ID,
    secret: process.env.GITHUB_CLIENT_SECRET
  }).login(['public_repo']);

  // Store info to verify against CSRF
  var state = githubAuthUrl.match(/&state=([0-9a-z]{32})/i);

  // Page Route
  app.get('/login/github', function(req, res) {
    res.redirect(githubAuthUrl);
  });

  app.get('/callback/github', function(req, res) {
    github.auth.login(req.query.code, function (err, token) {
      if (!err) {
        var client = github.client(token);
        client.get('/user', {}, function (err, status, body, headers) {
          if (err) {
            res.redirect("/#?error=" + encodeURIComponent("Cannot get user info from github"));
          } else {
            var username = body.login.toLowerCase();
            var repositoryName = username + ".github.io";

            client.me().repo({
              "name": repositoryName,
              "description": ""
            }, function(err, response) {
              /* ignore, if creation failed (maybe, because it already exists?) */
              var repository = client.repo(username + '/' + repositoryName);
              client.repo(username + '/' + repositoryName).info(function(err, repositoryInfo) {
                if (err) {
                  res.redirect("/#?error=" + encodeURIComponent("Cannot get/create the repository at " + repositoryName));
                } else {
                  repository.contents('twtxt.txt', function(err, contents) {
                    if (err) {
                      var initialContent = [
                        new Date().toISOString() + "\t/nick " + username,
                        new Date().toISOString() + "\t/twturl https://" + repositoryName + "/twtxt.txt",
                        new Date().toISOString() + "\t/follow dracoblue https://dracoblue.net/twtxt.txt",
                        new Date().toISOString() + "\t/follow buckket https://buckket.org/twtxt.txt",
                        new Date().toISOString() + "\t/follow twtxt_news https://buckket.org/twtxt_news.txt"
                      ].join("\n");

                      repository.createContents('twtxt.txt', 'created twtxt.txt', initialContent, function(err) {
                        if (err) {
                          res.redirect("/#?error=" + encodeURIComponent("Cannot create twtxt.txt in the repository at " + repositoryName));
                        } else {
                          res.redirect("/#?isNew=true&githubAccessToken=" + encodeURIComponent(token) + "&githubLogin=" + encodeURIComponent(body.login));
                        }
                      });
                    } else {
                      res.redirect("/#?isNew=false&githubAccessToken=" + encodeURIComponent(token) + "&githubLogin=" + encodeURIComponent(body.login));
                    }
                  });
                }
              });
            });
          }
        });
      } else {
        res.redirect("/#?error=" + encodeURIComponent("Invalid code from github"));
      }
    });
  });
}

// Page Route
app.get('/api/fetchTwtxt', routes.fetchTwtxt);

// Set /public as our static content dir
app.use("/", express.static(__dirname + "/public/"));

// Fire this bitch up (start our server)
var server = http.createServer(app).listen(port, function() {
  console.log('Express server listening on port ' + port);
});