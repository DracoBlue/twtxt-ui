# Twtxt UI for Webbrowser

A simple web driven ui for twtxt (uses local storage and a nodejs server).

## Requirements:

- Serverside: [nodejs](https://nodejs.org)
- Clientside: A Recent Webbrowser

## How to Use

1. Clone the repo: `git clone git@github.com:DracoBlue/twtxt-ui`
2. Go into folder: `cd twtxt-ui`
3. Install dependencies: `npm install`
4. Build dependencies: `npm build`
5. Start the app: `node server.js`
6. View in browser at: `http://localhost:8080`

## Usage

So far there is no fancy UI to add new users. So you have to open the JS-Console in your browser and type:

``` javascript
fetcher.follow('dracoblue', 'https://dracoblue.net/twtxt.txt');
```

This will add all posts by this user to your timeline.

Use

``` javascript
fetcher.unfollow('dracoblue')
```

or

``` javascript
fetcher.follow('https://dracoblue.net/twtxt.txt');
```

to unfollow an account. No new updates will be visible in your timeline.

All followed accounts will be visible after page refresh, because the information is stored in the localStorage of your
browser.

## Contributions

* This is a twtxt fork of the react/twitter example at <https://github.com/scotch-io/react-tweets>
* This is based on the code repository for the tutorial by @kenwheeler: [Build A Real-Time Twitter Stream with Node and React.js](http://scotch.io/tutorials/javascript/build-a-real-time-twitter-stream-with-node-and-react-js)

## License

This work is copyright by DracoBlue (http://dracoblue.net) and licensed under the terms of MIT License.