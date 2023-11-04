const express = require("express");
const router = express.Router();
const { generateRandomString, checkLogin } = require("../helpers");
const users = require("../data/users");
const urlDatabase = require("../data/urlDB");

////////////////////////////////////////////////////////////////////////////////
// GET REQUESTS
////////////////////////////////////////////////////////////////////////////////

/**
 * Renders TinyURL Information
 * if TinyURL does not exist in database gives 400 error
 */
router.get("/urls/:id", (req, res) => {
  const userId = req.session["userId"];
  const templateVars = { id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    username: users[userId]};
  if (!urlDatabase[req.params.id]) {
    res.status(400).send("Error 400: TinyUrl does not exist.");
    return;
  }
  if (!checkLogin(userId, users)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login.");
    return;
  }
  if (urlDatabase[req.params.id].userID !== userId) {
    res.status(401).send("Error 401: Unauthorized Access. TinyURL does not belong to this user.");
  }
  res.render("urls_show", templateVars);
});

/**
 * Directs user to longURL
 * If LongURL does not exist in database gives 404 error
 */
router.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.status(404).send("Error 404: URL not found");
    return;
  }
  res.redirect(longURL);
});

////////////////////////////////////////////////////////////////////////////////
// POST REQUESTS
////////////////////////////////////////////////////////////////////////////////

/**
 * Recieve new URL from new url form
 * Generate random string
 * Insert longURL with new random string as key
*/
router.post("/urls", (req, res) => {
  const userId = req.session["userId"];
  if (!checkLogin(userId, users)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login");
    return;
  }
  const tinyUrl = generateRandomString();
  const { longURL } =  req.body;
  urlDatabase[tinyUrl] = { longURL: longURL, userID: userId };
  
  res.redirect("/urls/" + tinyUrl);
});

/**
 * Updates longURL from edit form
 */
router.post("/urls/:id", (req, res) => {
  const userId = req.session["userId"];
  if (!checkLogin(userId, users)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login");
    return;
  }
  if (urlDatabase[req.params.id].userID !== userId) {
    res.status(401).send("Error 401: Unauthorized Access. TinyURL does not belong to this user.");
    return;
  }
  const id = req.params.id;
  const { longURL } = req.body;
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls/");
});

/**
 * Delete ShortUrl Entry from DB
 */
router.post("/urls/:id/delete", (req, res) => {
  const userId = req.session["userId"];
  if (!checkLogin(userId, users)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login");
    return;
  }
  if (!urlDatabase[req.params.id]) {
    res.status(400).send("Error 400: TinyUrl does not exist.");
    return;
  }
  if (urlDatabase[req.params.id].userID !== userId) {
    res.status(401).send("Error 401: Unauthorized Access. TinyURL does not belong to this user.");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

module.exports = router;