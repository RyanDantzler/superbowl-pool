require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const ObjectID = require('mongodb').ObjectID;

module.exports = function (app, myDatabase) {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    myDatabase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      if (err) return console.error(err);
      done(null, doc);
    });
  });
  passport.use(new LocalStrategy({ passReqToCallback: true },
    function(req, username, password, done) {      
      myDatabase.findOne({ username: username.toLowerCase() }, function(err, user) {
        req.session.messages = [];
        if (err) { return done(err); }
        if (!user) { 
          return done(null, false, { message: 'Incorrect username or password' }); 
        }
        if (!bcrypt.compareSync(password, user.password)) { 
          return done(null, false, { message: 'Incorrect username or password' }); 
        }

        // update user profile
        myDatabase.updateOne(
            { "_id": user._id },
            { $set: { last_login: new Date() }, $inc: { login_count: 1 } }
        );
        
        return done(null, user);
      });
    }
  ));
}