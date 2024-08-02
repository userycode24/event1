// controllers/AuthController.js
const bcrypt = require('bcrypt');
const passport = require('passport');
const pool = require('../config/database');

module.exports = {
  showLoginPage: (req, res) => {
    res.render('login');
  },

  login: (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
      if (err) return next(err);

      if (!user) {
        const errorMsg = info.message;
        req.flash('error_msg', errorMsg);
        return res.redirect('/login');
      }

      req.logIn(user, (err) => {
        if (err) return next(err);

        if (user.role === 'admin') {
          return res.redirect('/events');
        } else if (req.session.returnTo) {
          const redirectUrl = req.session.returnTo;
          delete req.session.returnTo;
          return res.redirect(redirectUrl);
        } else {
          return res.redirect('/');
        }
      });
    })(req, res, next);
  },

  showSignupPage: (req, res) => {
    res.render('signup');
  },

  signup: (req, res, next) => {
    passport.authenticate('local-signup', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) {
        const errorMsg = info.message;
        req.flash('error_msg', errorMsg);
        return res.redirect('/signup');
      }
      req.flash('success_msg', 'You have successfully signed up! Please log in.');
      res.redirect('/login');
    })(req, res, next);
  },

  logout: (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  },

  showChangePasswordPage: (req, res) => {
    if (req.user.role === 'admin') {
      res.render('change-password');
    } else {
      res.redirect('/');
    }
  },

  changePassword: async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.redirect('/');
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
      const user = rows[0];

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        req.flash('error_msg', 'Current password is incorrect');
        return res.redirect('/change-password');
      }

      const hash = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);

      req.flash('success_msg', 'Password updated successfully');
      res.redirect('/');
    } catch (err) {
      console.error('Error changing password:', err);
      req.flash('error_msg', 'An error occurred while changing the password');
      res.redirect('/change-password');
    }
  }
};
