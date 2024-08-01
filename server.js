// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const flash = require('connect-flash');
const layout = require('express-ejs-layouts');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('./config/database'); // Import the database pool
const app = express();

const port = process.env.PORT || 8080;

// Database and Passport configuration
require('./config/passport')(passport);

// Middleware setup
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(layout);
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Required for Passport
app.use(session({
    secret: 'vidyapathaisalwaysrunning', // Change this to a more secure secret
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Middleware to make `isAuthenticated` available in all views
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.user = req.user; // Optionally pass user info
    next();
});

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect('/login');
}

// Routes
require('./app/routes.js')(app, passport, isAuthenticated);

// Function to create default admin user if users table is empty
async function createDefaultAdmin() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users');
    if (rows[0].count === 0) {
      const username = 'admin';
      const password = 'admin123'; // Default password, consider changing this and make sure to hash it
      const hash = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, 'admin']);
      console.log('Default admin user created.');
    } else {
      console.log('Users already exist in the database.');
    }
  } catch (err) {
    console.error('Error checking or creating admin user:', err);
  }
}



// Start the server and create default admin if needed
app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await createDefaultAdmin(); // Check and create the admin user if necessary
});
