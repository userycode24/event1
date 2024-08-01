// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('./database'); // Adjust the path as necessary

module.exports = function(passport) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
      done(null, rows[0]);
    } catch (err) {
      done(err);
    }
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  }, async (req, username, password, done) => {
    try {
      const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
      if (rows.length) {
        return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
      } else {
        const hash = await bcrypt.hash(password, 10);
        const newUser = { username, password: hash };
        const [result] = await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [newUser.username, newUser.password]);
        newUser.id = result.insertId;
        return done(null, newUser);
      }
    } catch (err) {
      return done(err);
    }
  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================

  passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  }, async (req, username, password, done) => {
    try {
      const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
      if (!rows.length) {
        return done(null, false, req.flash('loginMessage', 'No user found.'));
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
};
