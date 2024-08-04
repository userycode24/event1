const { body, validationResult } = require("express-validator");
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
    const events = await Event.getAllEvents();
    res.render("home", { events });
  } catch (err) {
    console.error("Error fetching events:", err);
    req.flash("error_msg", "Error fetching events.");
    res.redirect("/");
  }
};

// Show specific event page
// controllers/EventController.js
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
  body("title")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long")
    .trim()
    .escape(),
  body("description")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long")
    .trim()
    .escape(),
  body("date").isISO8601().withMessage("Date must be a valid ISO date"),
  body("time").isISO8601().withMessage("Time must be a valid ISO time"),
  body("location").optional().trim().escape(),
  body("plan")
    .optional()
    .isJSON()
    .withMessage("Plan must be a valid JSON format"),
  body("participation_details").optional().trim().escape(),
  body("additional_info").optional().trim().escape(),

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
      title,
      description,
      imageUrl,
      date,
      time,
      location,
      plan,
      participation_details,
      additional_info,
    } = req.body;
    try {
      await Event.addEvent(
        title,
        description,
        imageUrl,
        date,
        time,
        location,
        plan,
        participation_details,
        additional_info
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
  body("title")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long")
    .trim()
    .escape(),
  body("description")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long")
    .trim()
    .escape(),
  body("date").isISO8601().withMessage("Date must be a valid ISO date"),
  body("time").isISO8601().withMessage("Time must be a valid ISO time"),
  body("location").optional().trim().escape(),
  body("plan")
    .optional()
    .isJSON()
    .withMessage("Plan must be a valid JSON format"),
  body("participation_details").optional().trim().escape(),
  body("additional_info").optional().trim().escape(),

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
      title,
      description,
      imageUrl,
      date,
      time,
      location,
      plan,
      participation_details,
      additional_info,
    } = req.body;
    try {
      await Event.updateEvent(
        id,
        title,
        description,
        imageUrl,
        date,
        time,
        location,
        plan,
        participation_details,
        additional_info
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
