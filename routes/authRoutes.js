// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Show login form
router.get('/login', (req, res) => {
  res.render('login', {
    error_msg: req.flash('error_msg') // Pass flash messages to the view
  });
});

// Handle login logic
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true // Ensure flash messages are enabled
}));

// Show signup form
router.get('/signup', (req, res) => {
  res.render('signup', {
    error_msg: req.flash('error_msg') // Pass flash messages to the view
  });
});

// Handle signup logic
router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash: true
}));

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

module.exports = router;
