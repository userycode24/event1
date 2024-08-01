// scripts/create_database.js
const pool = require('../config/database');

async function createDatabase() {
  try {
    const connection = await pool.getConnection();
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS users_db`);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(20) NOT NULL,
        password CHAR(60) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE INDEX id_UNIQUE (id ASC),
        UNIQUE INDEX username_UNIQUE (username ASC)
      )
    `);

    console.log('Success: Database and Table Created!');
    connection.release();
  } catch (err) {
    console.error('Error creating database or table:', err);
  }
}

createDatabase();
