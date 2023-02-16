const passport = require('passport');
const bcrypt = require('bcrypt');
const { check, body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const validate = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    req.session.messages = req.session.messages || [];
    for (error of errors.array()) {
      req.session.messages.push(error.msg);
    }
    
    res.redirect(req.originalUrl);
  }
};

const registerValidate = [
  body('username', 'Username is a required field').exists()
    .trim().escape(),
  body('password', 'Password is a required field').exists()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches('[0-9]').withMessage('Password must contain a number')
    .matches('[A-Z]').withMessage('Password must contain an uppercase letter')
    .trim().escape(),
  body('firstname', 'First Name is a required field').exists()
    .trim().escape(),
  body('lastname', 'Last Name is a required field').exists()
    .trim().escape()
];

module.exports = function (app, myDatabase) {
  app.route('/').get((req, res) => {
    console.log(req.user);
    if(req.isAuthenticated()) {
      res.render('index', { 
        id: req.user.id,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        initials: req.user.initials,
        authenticated: true,
        admin: req.user.admin
      });
    } else {
      let errorMessages = null;
      if (req.session && req.session.messages) {
        errorMessages = req.session.messages;
        delete req.session.messages;
      }
      //TODO: display login error messages
      res.render('login');
    }
  });

    app.route('/login').get((req, res) => {
    if(req.isAuthenticated()) {
      res.render('index', {
        id: req.user.id,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        initials: req.user.initials,
        authenticated: true,
        admin: req.user.admin
      });
    } else {
      res.render('login');
    }
  });

  app.route('/register').get((req, res) => {
    if(req.isAuthenticated()) {
      res.sendFile(process.cwd() + '/views/index.html');
    } else {
      let errorMessages = null;
      if (req.session && req.session.messages) {
        errorMessages = req.session.messages;
        delete req.session.messages;
      }
      //TODO: display registration error messages
      res.sendFile(process.cwd() + '/views/login.html');
    }
  });

  app.route('/login').post(validate([
      body('username', 'Username is a required field.').exists(),
      body('password', 'Password is a required field.').exists()
    ]),
    passport.authenticate('local', { failureRedirect: '/', failureMessage: true }), (req, res) => {
      res.redirect('/');
    });

  app.route('/logout').get((req, res) => {
    req.logout();
    res.redirect('/');
  });
  
  app.route('/register').post(validate(registerValidate),
    (req, res, next) => {
      const hash = bcrypt.hashSync(req.body.password, 12);
      myDatabase.findOne({ username: req.body.username.toLowerCase() }, function(err, user) {
        if (err) {
          next(err);
        } else if (user) {
          req.session.messages = [ `Username '${req.body.username}' is already taken` ];
          res.redirect('/register');
        } else {
          let rand = Math.floor(Math.random() * 6);
          myDatabase.insertOne({
            id: uuidv4(),
            username: req.body.username.toLowerCase(),
            password: hash,
            name: req.body.firstname + ' ' + req.body.lastname,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            initials: req.body.firstname.charAt(0).toUpperCase() + req.body.lastname.charAt(0).toUpperCase(),
            created_on: new Date(),
            last_login: new Date(),
            admin: false
          }, (err, doc) => {
              if (err) {
                res.redirect('/');
              } else {
                // The inserted document is held within
                // the ops property of the doc
                next(null, doc.ops[0]);
              }
            }
          );
        }
      });
    }, 
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/');
    });

  app.use((req, res, next) => {
    res.status(404).type('text').send('Not Found');
  });

  // Error handling
  app.use((err, req, res, next) => {
    console.log(err.message);
    res.status(400).send({ error: err.message });
  });
};

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};