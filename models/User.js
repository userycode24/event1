// models/User.js
const pool = require('../config/database');

module.exports = {
  // Find a user by their ID
  async findById(id) {
    try {
      const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
      return rows[0];
    } catch (err) {
      throw new Error('An error occurred while fetching the user.');
    }
  },

  // Find a user by their email
  async findByEmail(email) {
    try {
      const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      return rows[0];
    } catch (err) {
      throw new Error('An error occurred while fetching the user.');
    }
  },

  // Create a new user
  async createUser(nom, prenom, email, password) {
    try {
      const [result] = await pool.query("INSERT INTO users (nom, prenom, email, password) VALUES (?, ?, ?, ?)", [nom, prenom, email, password]);
      return result.insertId;
    } catch (err) {
      throw new Error('An error occurred while creating the user.');
    }
  }
};
