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
        apercu TEXT,
        description TEXT,
        image_url TEXT NOT NULL,
        date_debut DATE,
        date_fin DATE,
        time TIME,
        lieu VARCHAR(255),
        plan JSON,
        observations TEXT,
        participation TEXT,
        info_add TEXT
      )
    `);

    const [events] = await connection.query(
      "SELECT COUNT(*) AS count FROM evenements"
    );
    const eventCount = events[0].count;

    if (eventCount === 0)
      await connection.query(`
INSERT INTO Evenements (titre, apercu, description, image_url, date_debut, date_fin, time, lieu, plan, observations, participation, info_add) VALUES
('Olive Harvest Festival', 'A festival celebrating the olive harvest.', 'The Olive Harvest Festival is an annual event that brings together the community to celebrate the rich tradition of olive harvesting. The festival features a variety of activities, including live music, traditional dance performances, and local food stalls showcasing dishes made with olives. The event is an opportunity for visitors to learn about the olive harvesting process, from picking to pressing, and to taste a wide range of olive products. Local farmers and producers will share their knowledge and stories, making it an educational and enjoyable experience for all ages.', '/img/event1.jpg', '2024-08-04', '2024-08-06', '10:00:00', 'Olive Grove', '["9:00 AM - Opening Ceremony", "10:30 AM - Olive Picking", "1:00 PM - Lunch", "2:30 PM - Olive Oil Tasting"]', 'Bring comfortable shoes for walking in the grove.', 'Open to all ages; ideal for families and olive enthusiasts.', 'Parking is available on-site; no pets allowed.'),

('Olive Oil Workshop', 'Hands-on workshop on olive oil production.', 'This interactive workshop offers a comprehensive look at the art and science of olive oil production. Participants will gain hands-on experience in olive oil tasting, learning to identify the different qualities and flavors of various olive oils. The workshop will cover the entire production process, from the selection of olives to the extraction and bottling of the oil. Experts will discuss the importance of factors such as olive variety, ripeness, and processing techniques. Attendees will also have the chance to create their own blends and take home a bottle of their personalized olive oil.', '/img/event2.jpg', '2024-8-01', '2024-08-03', '14:00:00', 'Community Center', '["2:00 PM - Introduction", "2:30 PM - Olive Oil Tasting", "3:30 PM - Pressing Demonstration"]', 'Materials provided; dress for a hands-on experience.', 'Limited to 30 participants; suitable for adults.', 'Please notify us of any food allergies in advance.'),

('Olive Tree Planting Day', 'Community event for planting olive trees.', 'Olive Tree Planting Day is a community-driven initiative aimed at promoting environmental sustainability and enhancing local green spaces. Volunteers of all ages are invited to participate in planting olive trees throughout Greenfield Park. The event includes an educational segment where experts will teach proper planting techniques and the ecological benefits of olive trees. In addition to planting, participants will engage in activities such as mulching and watering. The event will conclude with a communal lunch where participants can share their experiences and learn more about ongoing environmental projects in the community.', '/img/event3.jpg', '2024-09-05', '2024-09-07', '09:00:00', 'Greenfield Park', '["9:00 AM - Registration", "9:30 AM - Planting Instructions", "10:00 AM - Tree Planting", "12:00 PM - Lunch"]', 'Wear outdoor clothing suitable for digging.', 'Open to all community members; children must be accompanied by an adult.', 'All necessary tools will be provided; bring your own water bottle.'),

('Olive Tasting Event', 'Taste and learn about various olive products.', 'The Olive Tasting Event is a delightful culinary experience that allows participants to explore the diverse world of olives. Guests will sample a variety of olive products, including different olive varieties, oils, and tapenades. Experts will provide insights into the history and cultivation of olives, as well as tips on pairing olive products with different foods. The event will feature guided tastings, where attendees will learn to discern subtle flavor notes and quality indicators. This event is perfect for food enthusiasts and those looking to deepen their appreciation of olives.', '/img/event4.jpg', '2024-12-01', '2024-12-06', '16:00:00', 'Downtown Plaza', '["4:00 PM - Welcome", "4:15 PM - Olive Tasting", "5:00 PM - Q&A Session"]', 'Taste a range of olive varieties.', 'Open to food enthusiasts and olive lovers.', 'Products available for purchase at the end of the event.'),

('Olive Festival Gala', 'Gala event with olive-themed entertainment.', 'The Olive Festival Gala is the highlight of the olive harvest season, offering a night of elegance and celebration. This black-tie event features a gourmet dinner crafted by renowned chefs, showcasing dishes that highlight the versatility and flavor of olives. Guests will enjoy live music and entertainment, including performances by local artists. The gala also includes a silent auction with exclusive olive-themed items, with proceeds supporting local farmers and sustainable agriculture projects. This evening promises to be a memorable experience, filled with good food, great company, and a deep appreciation for the olive harvest.', '/img/event5.jpg', '2024-12-20', '2024-12-26', '19:00:00', 'Grand Hall', '["7:00 PM - Reception", "7:30 PM - Dinner", "8:30 PM - Live Music", "10:00 PM - Auction"]', 'Formal attire required.', 'Suitable for adults; a ticketed event.', 'All proceeds go towards supporting local agriculture.');

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
    const [users] = await connection.query(
      "SELECT COUNT(*) AS count FROM users"
    );
    const usersCount = users[0].count;

    if (usersCount === 0) {
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
