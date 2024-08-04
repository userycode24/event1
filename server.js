// server.js
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
require("./config/passport")(passport);

const app = express();

// Import and run the database creation script
const createDatabase = require("./scripts/create_database");
createDatabase();

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Use express-ejs-layouts
app.use(expressLayouts);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Body parser
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");

app.use("/", indexRoutes);
app.use("/", authRoutes);

// Start the server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
