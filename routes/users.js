const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../config/database');

// Route for registration page
router.get('/register', (req, res) => {
  res.render('register');
});

// Route for handling registration form submission
router.post('/register', (req, res, next) => {
  passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/register',
    failureFlash: true
  })(req, res, next);
});

// Route for login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Route for handling login form submission
router.post('/login', (req, res, next) => {
  passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// Route for logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

module.exports = router;
