const pool = require("../config/database");

class Event {
  static async getAllEvents() {
    try {
      const [rows] = await pool.query("SELECT * FROM Evenements");
      return rows.map((row) => {
        return {
          ...row,
          plan: JSON.parse(row.plan),
        };
      });
    } catch (err) {
      throw new Error("An error occurred while fetching events.");
    }
  }

  static async getEventById(id) {
    try {
      const [rows] = await pool.query("SELECT * FROM Evenements WHERE id = ?", [
        id,
      ]);
      if (rows.length > 0) {
        return {
          ...rows[0],
          plan: JSON.parse(rows[0].plan),
        };
      } else {
        throw new Error("Event not found.");
      }
    } catch (err) {
      throw new Error("An error occurred while fetching the event.");
    }
  }
  static async addEvent(
    titre,
    description,
    image_url,
    date,
    time,
    lieu,
    plan,
    participation_details,
    additional_info
  ) {
    try {
      await pool.query(
        "INSERT INTO Evenements (titre, description, image_url, date, lieu,plan, participation_details, additional_info) VALUES (?, ?, ?, ?, ?,?,?,?)",
        [
          titre,
          description,
          image_url,
          date,
          time,
          lieu,
          plan,
          participation_details,
          additional_info,
        ]
      );
    } catch (err) {
      throw new Error("An error occurred while adding the event.");
    }
  }

  static async updateEvent(
    id,
    titre,
    description,
    image_url,
    date,
    time,
    lieu,
    plan,
    participation_details,
    additional_info
  ) {
    try {
      await pool.query(
        "UPDATE Evenements SET titre = ?, description = ?, image_url = ?, date = ?, time = ?, lieu = ?,plan = ?, participation_details = ?, additional_info = ? WHERE id = ?",
        [
          titre,
          description,
          image_url,
          date,
          lieu,
          plan,
          participation_details,
          additional_info,
          id,
        ]
      );
    } catch (err) {
      throw new Error("An error occurred while updating the event.");
    }
  }

  static async deleteEvent(id) {
    try {
      await pool.query("DELETE FROM Evenements WHERE id = ?", [id]);
    } catch (err) {
      throw new Error("An error occurred while deleting the event.");
    }
  }
}

module.exports = Event;
