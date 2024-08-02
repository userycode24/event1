// models/Event.js
const pool = require('../config/database');

module.exports = {
  async getAll() {
    try {
      const [rows] = await pool.query("SELECT * FROM events");
      return rows;
    } catch (err) {
      throw new Error('An error occurred while fetching events.');
    }
  },

  async getById(id) {
    try {
      const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [id]);
      return rows[0];
    } catch (err) {
      throw new Error('An error occurred while fetching the event.');
    }
  }
};
