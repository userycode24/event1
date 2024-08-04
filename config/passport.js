const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const pool = require("./database");

module.exports = function (passport) {
  passport.serializeUser((user, done) => {
    // if (!user.id) {
    //   return done(new Error('User ID is missing'));
    // }
    done(null, user.id);
    // console.log(user.id); // Consider removing or replacing with a logger
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
      done(null, rows[0]);
    } catch (err) {
      done(err);
    }
  });

  // passport.use('local-signup', new LocalStrategy({
  //   usernameField: 'username',
  //   passwordField: 'password',
  //   passReqToCallback: true
  // }, async (req, username, password, done) => {
  //   try {
  //     const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
  //     if (rows.length) {
  //       return done(null, false, { message: 'That username is already taken.' });
  //     } else {
  //       const hash = await bcrypt.hash(password, 10);
  //       const newUser = { username, password: hash };
  //       const [result] = await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [newUser.username, newUser.password]);
  //       newUser.id = result.insertId;
  //       return done(null, newUser);
  //     }
  //   } catch (err) {
  //     return done(err);
  //   }
  // }));
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          const { email, nom, prenom } = req.body;
          const [rows] = await pool.query(
            "SELECT * FROM users WHERE username = ? OR email = ?",
            [username, email]
          );
          if (rows.length) {
            return done(null, false, {
              message: "That username or email is already taken.",
            });
          } else {
            const hash = await bcrypt.hash(password, 10);
            const newUser = { username, email, password: hash, nom, prenom };
            const [result] = await pool.query(
              "INSERT INTO users (username, email, password, nom, prenom) VALUES (?, ?, ?, ?, ?)",
              [
                newUser.username,
                newUser.email,
                newUser.password,
                newUser.nom,
                newUser.prenom,
              ]
            );
            newUser.id = result.insertId;
            return done(null, newUser);
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // passport.use(
  //   "local-login",
  //   new LocalStrategy(
  //     {
  //       usernameField: "username",
  //       passwordField: "password",
  //       passReqToCallback: true,
  //     },
  //     async (req, username, password, done) => {
  //       try {
  //         const [rows] = await pool.query(
  //           "SELECT * FROM users WHERE username = ?",
  //           [username]
  //         );
  //         if (!rows.length) {
  //           return done(null, false, { message: "No user found." });
  //         }

  //         const user = rows[0];
  //         const isMatch = await bcrypt.compare(password, user.password);
  //         if (!isMatch) {
  //           return done(null, false, { message: "Oops! Wrong password." });
  //         }

  //         return done(null, user);
  //       } catch (err) {
  //         return done(err);
  //       }
  //     }
  //   )
  // );
  // passport.use(
  //   "local-login",
  //   new LocalStrategy(
  //     {
  //       usernameField: "email",
  //       passwordField: "password",
  //       passReqToCallback: true,
  //     },
  //     async (req, email, password, done) => {
  //       try {
  //         const [rows] = await pool.query(
  //           "SELECT * FROM users WHERE email = ?",
  //           [email]
  //         );
  //         if (!rows.length) {
  //           return done(null, false, {
  //             message: "No user found with that email.",
  //           });
  //         }

  //         const user = rows[0];
  //         const isMatch = await bcrypt.compare(password, user.password);
  //         if (!isMatch) {
  //           return done(null, false, { message: "Incorrect password." });
  //         }

  //         return done(null, user);
  //       } catch (err) {
  //         return done(err);
  //       }
  //     }
  //   )
  // );
  // passport.use(
  //   "local-login",
  //   new LocalStrategy(
  //     {
  //       usernameField: "email",
  //       passwordField: "password",
  //       passReqToCallback: true,
  //     },
  //     async (req, email, password, done) => {
  //       try {
  //         if (!email || !password) {
  //           return done(null, false, { message: "Missing credentials" });
  //         }

  //         const [rows] = await pool.query(
  //           "SELECT * FROM users WHERE email = ?",
  //           [email]
  //         );
  //         if (!rows.length) {
  //           return done(null, false, {
  //             message: "No user found with that email.",
  //           });
  //         }

  //         const user = rows[0];
  //         const isMatch = await bcrypt.compare(password, user.password);
  //         if (!isMatch) {
  //           return done(null, false, { message: "Incorrect password." });
  //         }

  //         return done(null, user);
  //       } catch (err) {
  //         return done(err);
  //       }
  //     }
  //   )
  // );
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          if (!email || !password) {
            return done(null, false, { message: "Missing credentials" });
          }

          const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
          );
          if (!rows.length) {
            return done(null, false, {
              message: "No user found with that email.",
            });
          }

          const user = rows[0];

          if (!user.isVerified) {
            return done(null, false, {
              message: "Account not verified. Please check your email.",
            });
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Incorrect password." });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
