const express = require("express");
const path = require("path");
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require("mongoose");
const User = require("./models/user");
require("dotenv").config();

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

let users;

//MONGO DB START

mongoose
  .connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("connected to mongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

//MONGO DB END

//EXPRESS START

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//PAGES START

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index");
});

User.find()
  .then((result) => {
    users = result;
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

//PAGES END

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.delete("/logout", function (req, res, next) {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(process.env.PORT, () => {
  console.log("Listening on port", port);
});
