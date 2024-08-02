const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

// Route for rendering events, requires admin access
router.get('/events', isAuthenticated, isAdmin, (req, res) => {
  res.render('events');
});

// Route for rendering a specific event, requires admin access
router.get('/event', isAuthenticated, isAdmin, (req, res) => {
  res.render('event');
});

// Other routes...
router.get('/', (req, res) => {
  res.render('home');
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/category', (req, res) => {
  res.render('category');
});

router.get('/speakers', (req, res) => {
  res.render('speakers');
});

router.get('/contact', (req, res) => {
  res.render('contact');
});

router.get('/404', (req, res) => {
  res.render('404');
});

module.exports = router;

