// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const authController = require('../controllers/AuthController'); // Import the AuthController
const router = express.Router();

// Show login form
router.get('/login', authController.showLoginPage);

// Handle login logic
router.post('/login', authController.login);

// Show signup form
router.get('/signup', authController.showSignupPage);

// Handle signup logic
router.post('/signup', authController.signup);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
