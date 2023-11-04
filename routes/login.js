const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail, checkLogin } = require("../helpers");
const users = require("../data/users");
////////////////////////////////////////////////////////////////////////////////
// GET REQUESTS
////////////////////////////////////////////////////////////////////////////////

/**
 * Renders Reigstration Page
 */

router.get("/register", (req, res) => {
  const userId = req.session["userId"];
  const templateVars = { username: users[userId] };
  if (checkLogin(userId, users)) {
    res.redirect("/urls");
    return;
  }
  res.render("register", templateVars);
});

/**
 * Renders Login Page
 */

router.get("/login", (req, res) => {
  const userId = req.session["userId"];
  const templateVars = { username: users[userId] };
  if (checkLogin(userId, users)) {
    res.redirect("/urls");
    return;
  }
  res.render("login", templateVars);
});

////////////////////////////////////////////////////////////////////////////////
// POST REQUESTS
////////////////////////////////////////////////////////////////////////////////

/**
 * Recieve registration form data and store in Users Object
 */

router.post("/register", (req, res) => {
  const newUserId = generateRandomString();
  const newPassword = bcrypt.hashSync(req.body.password, 10);
  const newUser = {id: newUserId, email: req.body.email, password: newPassword };
  const emailSearch = getUserByEmail(newUser.email, users);
  if (newUser.email === "" || newUser.password === "") {
    res.status(400).send("Error 400: No Email or Password provided");
    return;
  } if (emailSearch !== undefined) {
    res.status(400).send("Error 400: Email already in use");
    return;
  }
  users[newUserId] = newUser;
  req.session.userId = newUserId;
  res.redirect("/urls");
});

/**
 * Recieves login requests
 */

router.post("/login", (req, res) => {
  const userLogin = { email: req.body.email, password: req.body.password };
  const emailSearch = getUserByEmail(userLogin.email, users);
  if (emailSearch === undefined) {
    res.status(400).send("Error 400: Email does not exist");
    return;
  }
  const passwordCheck = bcrypt.compareSync(userLogin.password, users[emailSearch].password);
  if (!passwordCheck) {
    res.status(400).send("Error 400: invalid password");
    return;
  }
  req.session.userId = users[emailSearch].id;
  res.redirect("/urls");
});

/**
 * Recieves logout requests
 */
router.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

module.exports = router;