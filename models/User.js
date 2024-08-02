// models/User.js
const pool = require('../config/database');

module.exports = {
  async findById(id) {
    try {
      const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
      return rows[0];
    } catch (err) {
      throw new Error('An error occurred while fetching the user.');
    }
  },

  async findByUsername(username) {
    try {
      const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
      return rows[0];
    } catch (err) {
      throw new Error('An error occurred while fetching the user.');
    }
  },

  async createUser(username, password) {
    try {
      const [result] = await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, password]);
      return result.insertId;
    } catch (err) {
      throw new Error('An error occurred while creating the user.');
    }
  }
};
