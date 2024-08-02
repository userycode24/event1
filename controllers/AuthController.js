// controllers/AuthController.js
const bcrypt = require('bcrypt');
const passport = require('passport');
const pool = require('../config/database');

module.exports = {
  // Show login page
  showLoginPage: (req, res) => {
    res.render('login', {
      error_msg: req.flash('error_msg')
    });
  },

  // Handle login
  login: (req, res, next) => {

    passport.authenticate('local-login', (err, user, info) => {
      if (err) {
        return next(err); // Handle errors properly
      }
  
      if (!user) {
        // If user is not found or password is incorrect, redirect with a flash message
        const errorMsg = info.message  ||'Invalid username or password'; // Fallback message
        console.log(errorMsg);
        req.flash('error_msg', errorMsg);
        return res.redirect('/login');
      }
  
      req.logIn(user, (err) => {
        if (err) { return next(err); }
  
        // Redirect based on user role
        if (user.role === 'admin') {
          return res.redirect('/events'); // Redirect admin to events
        } else if (req.session.returnTo) {
          const redirectUrl = req.session.returnTo;
          delete req.session.returnTo;
          return res.redirect(redirectUrl); // Redirect to the originally requested URL
        } else {
          return res.redirect('/'); // Default redirect for regular users
        }
      });
    })(req, res, next);
  },
  
  // Show signup page
  showSignupPage: (req, res) => {
    res.render('signup', {
      error_msg: req.flash('error_msg')
    });
  },

  // Handle signup
  signup: (req, res, next) => {
    passport.authenticate('local-signup', {
      successRedirect: '/profile',
      failureRedirect: '/signup',
      failureFlash: true
    })(req, res, next);
  },

  // Logout
  logout: (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  },

  // Show change password page (only for admin)
  showChangePasswordPage: (req, res) => {
    if (req.user.role === 'admin') {
      res.render('change-password'); // Ensure you have a view for this
    } else {
      res.redirect('/'); // Or some other page if the user is not admin
    }
  },

  // Handle password change
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
