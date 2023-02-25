'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes.js');
const auth = require('./auth.js');

const app = express();
const http = require('http').createServer(app);
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({ url: URI });
const mustacheExpress = require('mustache-express');
const favicon = require('serve-favicon');

// register '.html' extension with The Mustache Express
app.engine('html', mustacheExpress(__dirname + '/views/partials', '.html'));
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.static(process.cwd() + '/public'));
app.use(favicon(__dirname + '/public/images/favicon.ico'));

// limits the request body size passed. Default is 100kb
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  key: 'express.sid',
  store: store
}));

app.use(passport.initialize());
app.use(passport.session());

myDB(async client => {
  const myDatabase = await client.db('socketAuth').collection('users');
  const espnScoreboard = await client.db('espnScoreboard').collection('nfl');

  routes(app, myDatabase);
  auth(app, myDatabase);

}).catch((e) => {
  console.log(e);
  app.route('/').get((req, res) => {
    res.json({ title: e, message: 'Unable to login' });
    // res.render('mustache', { title: e, message: 'Unable to login' });
  });
});

function onAuthorizeSuccess(data, accept) {
  console.log('successful connection to socket.io');

  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log('failed connection to socket.io:', message);
  accept(null, false);
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});