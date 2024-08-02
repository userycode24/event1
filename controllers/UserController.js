// controllers/UserController.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');

module.exports = {
  async register(req, res) {
    // Handle user registration
  },

  async login(req, res) {
    // Handle user login
  },

  async logout(req, res) {
    req.logout();
    res.redirect('/');
  },

  async changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
      const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [userId]);
      const user = rows[0];

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        req.flash('error', 'Old password is incorrect.');
        return res.redirect('/change-password');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

      req.flash('success', 'Password changed successfully.');
      res.redirect('/profile');
    } catch (err) {
      req.flash('error', 'An error occurred while changing the password.');
      res.redirect('/change-password');
    }
  }
};

