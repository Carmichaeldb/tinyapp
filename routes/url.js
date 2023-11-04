const express = require("express");
const router = express.Router();
const { checkLogin, urlsForUsers } = require("../helpers");
const users = require("../data/users");
const urlDatabase = require("../data/urlDB");

////////////////////////////////////////////////////////////////////////////////
// GET REQUESTS
////////////////////////////////////////////////////////////////////////////////

router.get("/", (req, res) => {
  const userId = req.session["userId"];
  if (checkLogin(userId, users)) {
    res.redirect("/urls");
    return;
  }
  res.redirect("/login");
});

/**
 * Renders users My URLs page
 */

router.get("/urls", (req, res) => {
  const userId = req.session["userId"];
  const templateVars = {
    username: users[userId],
    urls: urlsForUsers(userId, urlDatabase) };
  if (!checkLogin(userId, users)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login");
    return;
  }
  res.render('urls_index', templateVars);
});

/**
 * Renders Create New URL page
 */

router.get("/urls/new", (req, res) => {
  const userId = req.session["userId"];
  const templateVars = {username: users[userId]};
  if (!checkLogin(userId, users)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login");
    return;
  }
  res.render("urls_new", templateVars);
});

module.exports = router;