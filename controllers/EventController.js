// controllers/EventController.js
const pool = require('../config/database');

module.exports = {
  async index(req, res) {
    try {
      const [events] = await pool.query("SELECT * FROM events");
      res.render('home', { events });
    } catch (err) {
      res.status(500).send('An error occurred while fetching events.');
    }
  },

  async show(req, res) {
    const { eventId } = req.params;
    try {
      const [event] = await pool.query("SELECT * FROM events WHERE id = ?", [eventId]);
      if (event.length === 0) {
        return res.status(404).render('404');
      }
      res.render('event', { event: event[0] });
    } catch (err) {
      res.status(500).send('An error occurred while fetching the event.');
    }
  }
};
