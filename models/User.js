const pool = require("../config/database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

class User {
  static async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async createUser(
    username,
    email,
    password,
    nom,
    prenom,
    verificationToken
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, email, password, nom, prenom, role, verificationToken, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        username,
        email,
        hashedPassword,
        nom,
        prenom,
        "user",
        verificationToken,
        false,
      ]
    );
  }

  static async verifyUser(token) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE verificationToken = ?",
      [token]
    );
    if (!rows.length) return null;
    const user = rows[0];
    await pool.query(
      "UPDATE users SET isVerified = ?, verificationToken = ? WHERE id = ?",
      [true, null, user.id]
    );
    return user;
  }

  static async findById(userId) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    return rows[0];
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);
  }
}

module.exports = User;
