const localStrategy = require("passport-local").Strategy;
const SHA256 = require("crypto-js/sha256");

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = (email, password, done) => {
    const user = getUserByEmail(email);
    if (user == null) {
      return done(null, false, { message: "No user with that email" });
    }

    try {
      if (user.password === SHA256(password).toString()) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: `Password is incorrect`,
        });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new localStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    done(null, getUserById(id));
  });
}

module.exports = initialize;
