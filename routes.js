var JSX = require('node-jsx').install(),
  React = require('react'),
  TweetsApp = React.createFactory(require('./components/TweetsApp.react')),
  url = require('url'),
  md5 = require('md5'),
  https = require('https'),
  http = require('http'),
  Memcached = require('memcached');


var cache = new Memcached((process.env.MEMCACHED_HOST || "localhost") + ":" + (process.env.MEMCACHED_PORT || "11211"))

module.exports = {

  index: function(req, res) {
    var markup = React.renderToString(
      TweetsApp({
        tweets: [],
        mentions: []
      })
    );

    // Render our 'home' template
    res.render('home', {
      markup: markup, // Pass rendered react markup
      state: JSON.stringify([]) // Pass current state to client side
    });
  },

  fetchTwtxt: function(req, res) {
    // Fetch tweets by page via param

    if (!req.query.url) {
      res.sendStatus(400);
      res.end();

      return ;
    }

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
              res.set('Content-Type', 'text/plain');
              res.set('Etag', md5(memcacheContent));
              res.send(memcacheContent);
              return ;
            }
            body = Buffer.concat(body).toString();

            if (clientRes.headers['last-modified']) {
              cache.set('last-modified-since-' + key, clientRes.headers['last-modified'], 60*60*24, function() {
              });
              cache.set('content-' + key, body, 60*60*24, function() {
              });
            }

            res.set('Content-Type', 'text/plain');
            res.set('Etag', md5(body));
            res.send(body);
          });

        }).on('error', function (e) {

        });
        req.end();
      });
    });
  }
};
