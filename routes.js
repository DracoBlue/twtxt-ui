var JSX = require('node-jsx').install(),
  React = require('react'),
  TweetsApp = React.createFactory(require('./components/TweetsApp.react')),
  url = require('url'),
  md5 = require('md5'),
  https = require('https'),
  http = require('http'),
  Memcached = require('memcached'),
  ReactDOMServer = require('react-dom/server');


var cache = new Memcached((process.env.MEMCACHED_HOST || "localhost") + ":" + (process.env.MEMCACHED_PORT || "11211"))

module.exports = {

  index: function(req, res) {
    var markup = ReactDOMServer.renderToString(
      TweetsApp({
        enableGithub: process.env.GITHUB_CLIENT_ID ? true : false
      })
    );

    // Render our 'home' template
    res.render('home', {
      markup: markup, // Pass rendered react markup
      state: JSON.stringify({
        enableGithub: process.env.GITHUB_CLIENT_ID ? true : false
      }) // Pass current state to client side
    });
  },

  fetchTwtxt: function(req, res) {
    // Fetch tweets by page via param

    if (!req.query.url) {
      res.sendStatus(400);
      res.end();

      return ;
    }

    var limit = req.query.limit || 0;

    var client = http;
    var urlParts = url.parse(req.query.url);

    if (!urlParts["hostname"] || !urlParts["protocol"]) {
      res.sendStatus(400);
      res.end();

      return ;
    }

    if (urlParts['protocol'] === "https:") {
      client = https;
    }

    var options = {
      hostname: urlParts['hostname'],
      port: urlParts['port'] || (urlParts['protocol'] === "https:" ? 443 : 80),
      path: urlParts['path'],
      method: 'GET',
      headers: {
        "User-Agent": "twtxt-registry/dev"
      }
    };

    var key = md5(req.query.url);

    var deliverWithLimit = function(body) {
      res.set('Content-Type', 'text/plain');
      if (limit != 0) {
        var lines = body.split("\n");
        if (lines.length > limit) {
          lines.sort();
          var limitedBody = lines.slice(-limit).join("\n");
          res.set('Etag', md5(limitedBody));
          res.send(limitedBody);
        } else {
          res.set('Etag', md5(body));
          res.send(body);
        }

      } else {
        res.set('Etag', md5(body));
        res.send(body);
      }
    };

    cache.get('content-' + key, function(err, memcacheContent) {
      cache.get('last-modified-since-' + key, function(err, memcacheLastModified) {

        if (memcacheLastModified && memcacheContent) {
          options.headers['If-Modified-Since'] = memcacheLastModified;
        }

        var req = client.request(options, function(clientRes) {
          var body = [];
          clientRes.on('data', function(chunk) {
            body.push(chunk);
          }).on('end', function() {
            if (clientRes.statusCode == 304) {
              deliverWithLimit(memcacheContent);
              return ;
            }
            body = Buffer.concat(body).toString();

            if (clientRes.headers['last-modified']) {
              cache.set('last-modified-since-' + key, clientRes.headers['last-modified'], 60*60*24, function() {
              });
              cache.set('content-' + key, body, 60*60*24, function() {
              });
            }

            deliverWithLimit(body);
          });

        }).on('error', function (e) {
          try {
            res.set('Content-Type', 'text/plain');
            res.status(500);
            res.send(e.message || "error");
          } catch (error) {
            /* swallow */
          }
        }).on('timeout', function(e) {
          res.set('Content-Type', 'text/plain');
          res.status(504);
          res.send("timeout");
        });
        req.setTimeout(5000);
        req.end();
      });
    });
  }
};
