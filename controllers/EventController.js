const { body, validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs").promises;
const Event = require("../models/Event");

// Show all events page
module.exports.showEventsPage = async (req, res) => {
  try {
    const events = await Event.getAllEvents();
    res.render("events", { events });
  } catch (err) {
    console.error("Error fetching events:", err);
    req.flash("error_msg", "Error fetching events.");
    res.redirect("/");
  }
};

// Show home page
module.exports.showHomePage = async (req, res) => {
  try {
    // Fetch events data
    const events = await Event.getAllEvents();

    // Fetch news data from the JSON file
    const newsFilePath = path.join(__dirname, "../data/news.json"); // Adjust the path if needed
    const newsData = await fs.readFile(newsFilePath, "utf8");
    const newsArray = JSON.parse(newsData);
    console.log(newsArray);

    // Render the home page with both events and news data
    res.render("home", { events, news: newsArray });
  } catch (err) {
    console.error("Error fetching events or news:", err);
    req.flash("error_msg", "Error fetching events or news.");
    res.redirect("/");
  }
};

// Show specific event page
module.exports.showEventPage = async (req, res) => {
  const { id } = req.params; // Use req.params for route parameters
  try {
    const event = await Event.getEventById(id);
    if (event) {
      res.render("event", { event });
    } else {
      req.flash("error_msg", "Event not found.");
      res.redirect("/events");
    }
  } catch (err) {
    console.error("Error fetching event:", err);
    req.flash("error_msg", "Error fetching event.");
    res.redirect("/events");
  }
};

// Add a new event
module.exports.addEvent = [
  body("titre")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long")
    .trim()
    .escape(),
  body("apercu").optional().trim().escape(),
  body("description")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long")
    .trim()
    .escape(),
  body("date").isISO8601().withMessage("Date must be a valid ISO date"),
  body("time").isISO8601().withMessage("Time must be a valid ISO time"),
  body("lieu").optional().trim().escape(),
  body("plan")
    .optional()
    .isJSON()
    .withMessage("Plan must be a valid JSON format"),
  body("observations").optional().trim().escape(),
  body("participation").optional().trim().escape(),
  body("info_add").optional().trim().escape(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash(
        "error_msg",
        errors.array().map((err) => err.msg)
      );
      return res.redirect("/events");
    }

    const {
      titre,
      apercu,
      description,
      image_url,
      date,
      time,
      lieu,
      plan,
      observations,
      participation,
      info_add,
    } = req.body;

    try {
      await Event.addEvent(
        titre,
        apercu,
        description,
        image_url,
        date,
        time,
        lieu,
        plan,
        observations,
        participation,
        info_add
      );
      req.flash("success_msg", "Event added successfully.");
      res.redirect("/events");
    } catch (err) {
      console.error("Error adding event:", err);
      req.flash("error_msg", "Error adding event.");
      res.redirect("/events");
    }
  },
];

// Update an existing event
module.exports.updateEvent = [
  body("id").isInt().withMessage("Event ID must be a number"),
  body("titre")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long")
    .trim()
    .escape(),
  body("apercu").optional().trim().escape(),
  body("description")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long")
    .trim()
    .escape(),
  body("date").isISO8601().withMessage("Date must be a valid ISO date"),
  body("time").isISO8601().withMessage("Time must be a valid ISO time"),
  body("lieu").optional().trim().escape(),
  body("plan")
    .optional()
    .isJSON()
    .withMessage("Plan must be a valid JSON format"),
  body("observations").optional().trim().escape(),
  body("participation").optional().trim().escape(),
  body("info_add").optional().trim().escape(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash(
        "error_msg",
        errors.array().map((err) => err.msg)
      );
      return res.redirect("/events");
    }

    const {
      id,
      titre,
      apercu,
      description,
      image_url,
      date,
      time,
      lieu,
      plan,
      observations,
      participation,
      info_add,
    } = req.body;

    try {
      await Event.updateEvent(
        id,
        titre,
        apercu,
        description,
        image_url,
        date,
        time,
        lieu,
        plan,
        observations,
        participation,
        info_add
      );
      req.flash("success_msg", "Event updated successfully.");
      res.redirect("/events");
    } catch (err) {
      console.error("Error updating event:", err);
      req.flash("error_msg", "Error updating event.");
      res.redirect("/events");
    }
  },
];

// Delete an event
module.exports.deleteEvent = async (req, res) => {
  const { id } = req.body;
  try {
    await Event.deleteEvent(id);
    req.flash("success_msg", "Event deleted successfully.");
    res.redirect("/events");
  } catch (err) {
    console.error("Error deleting event:", err);
    req.flash("error_msg", "Error deleting event.");
    res.redirect("/events");
  }
};
