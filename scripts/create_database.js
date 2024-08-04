// scripts/create_database.js
const pool = require("../config/database");
const bcrypt = require("bcrypt");

async function createDatabase() {
  try {
    const connection = await pool.getConnection();

    // Create database and users table
    await connection.query(`CREATE DATABASE IF NOT EXISTS users_db`);
    await connection.query(`USE users_db`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(20) NOT NULL,
        email VARCHAR(50) NOT NULL,
        password CHAR(60) NOT NULL,
        nom VARCHAR(50) NOT NULL,
        prenom VARCHAR(50) NOT NULL,
        role VARCHAR(255) DEFAULT 'user',
        verificationToken VARCHAR(255) NULL,
        isVerified BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (id),
        UNIQUE INDEX id_UNIQUE (id ASC),
        UNIQUE INDEX username_UNIQUE (username ASC),
        UNIQUE INDEX email_UNIQUE (email ASC)
      )
    `);

    // Create Evenements table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Evenements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titre VARCHAR(255),
        description TEXT,
        image_url TEXT NOT NULL,
        date DATE,
        time TIME,
        lieu VARCHAR(255),
        plan JSON,
        participation_details TEXT,
        additional_info TEXT
      )
    `);

    // Create Programmes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Programmes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        jour DATE,
        description TEXT,
        evenement_id INT,
        FOREIGN KEY (evenement_id) REFERENCES Evenements(id)
      )
    `);

    // Create Speakers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Speakers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100),
        prenom VARCHAR(100),
        description TEXT,
        evenement_id INT,
        FOREIGN KEY (evenement_id) REFERENCES Evenements(id)
      )
    `);

    // Create Sponsors table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Sponsors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100),
        description TEXT,
        evenement_id INT,
        FOREIGN KEY (evenement_id) REFERENCES Evenements(id)
      )
    `);

    // Create Candidatures table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Candidatures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED,
        evenement_id INT,
        statut ENUM('en attente', 'accepte', 'refuse'),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (evenement_id) REFERENCES Evenements(id)
      )
    `);

    // Check if users table is empty
    const [rows] = await connection.query(
      "SELECT COUNT(*) AS count FROM users"
    );
    const count = rows[0].count;

    if (count === 0) {
      // Insert admin user
      const adminPassword = "admin_password"; // Replace with a secure password or environment variable
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminEmail = "admin@example.com";
      const adminNom = "Admin";
      const adminPrenom = "User";

      await connection.query(
        `
        INSERT INTO users (username, email, password, nom, prenom, role, isVerified) 
        VALUES (?, ?, ?, ?, ?, 'admin', true)
      `,
        ["admin", adminEmail, hashedPassword, adminNom, adminPrenom]
      );

      console.log("Admin user created with password: admin_password");
    } else {
      console.log("Admin user already exists or other users present");
    }

    connection.release();
  } catch (err) {
    console.error("Error creating database, tables, or admin user:", err);
  }
}

module.exports = createDatabase;
