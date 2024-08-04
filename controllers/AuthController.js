const passport = require("passport");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

module.exports = {
  showLoginPage: (req, res) => {
    res.render("login");
  },

  login: (req, res, next) => {
    passport.authenticate("local-login", (err, user, info) => {
      if (err) return next(err);

      if (!user) {
        const errorMsg = info.message || "Login failed.";
        req.flash("error_msg", errorMsg);
        return res.redirect("/login");
      }

      req.logIn(user, (err) => {
        if (err) return next(err);

        if (user.role === "admin") {
          return res.redirect("/events");
        } else if (req.session.returnTo) {
          const redirectUrl = req.session.returnTo;
          delete req.session.returnTo;
          return res.redirect(redirectUrl);
        } else {
          return res.redirect("/");
        }
      });
    })(req, res, next);
  },

  showSignupPage: (req, res) => {
    res.render("signup");
  },

  signup: [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long")
      .trim()
      .escape(),
    body("email").isEmail().withMessage("Enter a valid email address"),
    body("nom")
      .matches(/^[a-zA-Z]+$/)
      .withMessage("Nom can only contain letters")
      .trim()
      .escape(),
    body("prenom")
      .matches(/^[a-zA-Z]+$/)
      .withMessage("Prenom can only contain letters")
      .trim()
      .escape(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage("Password must contain both letters and numbers"),

    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash(
          "error_msg",
          errors.array().map((err) => err.msg)
        );
        return res.redirect("/signup");
      }

      const { username, email, password, nom, prenom } = req.body;
      try {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
          req.flash("error_msg", "Email is already registered");
          return res.redirect("/signup");
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        await User.createUser(
          username,
          email,
          password,
          nom,
          prenom,
          verificationToken
        );

        const verificationUrl = `http://localhost:3000/verify/${verificationToken}`;
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "snaiki282@gmail.com",
            pass: "fvxj mdok ehij gihc",
          },
        });

        const mailOptions = {
          from: "snaiki282@gmail.com",
          to: email,
          subject: "Account Verification",
          text: `Please verify your account by clicking the following link: ${verificationUrl}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error("Error sending email:", err);
            req.flash("error_msg", "Error sending verification email.");
            return res.redirect("/signup");
          }

          req.flash(
            "success_msg",
            "You have successfully signed up! Please check your email to verify your account."
          );
          res.redirect("/login");
        });
      } catch (err) {
        console.error("Error during signup:", err);
        req.flash("error_msg", "Server error, please try again later.");
        res.redirect("/signup");
      }
    },
  ],

  verifyAccount: async (req, res) => {
    const { token } = req.params;

    try {
      const user = await User.verifyUser(token);
      if (!user) {
        req.flash("error_msg", "Invalid verification token.");
        return res.redirect("/signup");
      }

      req.flash(
        "success_msg",
        "Your account has been verified. You can now log in."
      );
      res.redirect("/login");
    } catch (err) {
      console.error("Error verifying account:", err);
      req.flash(
        "error_msg",
        "An error occurred during verification. Please try again later."
      );
      res.redirect("/signup");
    }
  },

  logout: (req, res) => {
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/");
  },

  showChangePasswordPage: (req, res) => {
    if (req.user.role === "admin") {
      res.render("change-password");
    } else {
      res.redirect("/");
    }
  },

  changePassword: async (req, res) => {
    if (req.user.role !== "admin") {
      return res.redirect("/");
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user.id);
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        req.flash("error_msg", "Current password is incorrect");
        return res.redirect("/change-password");
      }

      await User.updatePassword(req.user.id, newPassword);
      req.flash("success_msg", "Password updated successfully");
      res.redirect("/");
    } catch (err) {
      console.error("Error changing password:", err);
      req.flash("error_msg", "An error occurred while changing the password");
      res.redirect("/change-password");
    }
  },
};
