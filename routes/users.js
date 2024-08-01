// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/database'); // Adjust the path as necessary

router.post('/signup', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
    res.redirect('/login');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
