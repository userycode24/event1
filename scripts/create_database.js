// scripts/create_database.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');

async function createDatabase() {
  try {
    const connection = await pool.getConnection();

    // Create database and table
    await connection.query(`CREATE DATABASE IF NOT EXISTS users_db`);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(20) NOT NULL,
        password CHAR(60) NOT NULL,
        role VARCHAR(255) DEFAULT 'user',
        PRIMARY KEY (id),
        UNIQUE INDEX id_UNIQUE (id ASC),
        UNIQUE INDEX username_UNIQUE (username ASC)
      )
    `);

    // Check if table is empty
    const [rows] = await connection.query('SELECT COUNT(*) AS count FROM users');
    const count = rows[0].count;

    if (count === 0) {
      // Insert admin user
      const adminPassword = 'admin_password'; // Replace with a secure password or environment variable
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await connection.query(`
        INSERT INTO users (username, password, role) 
        VALUES (?, ?, 'admin')
      `, ['admin', hashedPassword]);

      console.log('Admin user created with password: admin_password');
    } else {
      console.log('Admin user already exists or other users present');
    }

    connection.release();
  } catch (err) {
    console.error('Error creating database, table, or admin user:', err);
  }
}

module.exports = createDatabase;

