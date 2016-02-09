var JSX = require('node-jsx').install(),
  React = require('react'),
  TweetsApp = React.createFactory(require('./components/TweetsApp.react')),
  request = require('request'),
  url = require('url'),
  md5 = require('md5');

module.exports = {

  index: function(req, res) {
    var markup = React.renderToString(
      TweetsApp({
        tweets: []
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

    try {
      var parts = url.parse(req.query.url);

      if (!parts["hostname"] || !parts["protocol"]) {
        res.sendStatus(400);
        res.end();

        return ;
      }
    } catch (err) {
      res.sendStatus(400);
      res.end();

      return ;
    }

    request(req.query.url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.set('Content-Type', 'text/plain');
        res.set('Etag', md5(body.toString()));
        res.send(body);
      }
    });
  }


}
