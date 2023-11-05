const express = require("express");
const router = express.Router();
const moment = require('moment');
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
  const tinyUrl = req.params.id;
  const templateVars = { id: tinyUrl,
    longURL: urlDatabase[tinyUrl].longURL,
    username: users[userId],
    creationDate: urlDatabase[tinyUrl].creationDate,
    editDate: urlDatabase[tinyUrl].editDate,
    visits: urlDatabase[tinyUrl].visits,
    uniqueVisits: urlDatabase[tinyUrl].uniqueVisits };
  if (!urlDatabase[tinyUrl]) {
    res.status(400).send("Error 400: TinyUrl does not exist.");
    return;
  }
  if (!checkLogin(userId, users)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login.");
    return;
  }
  if (urlDatabase[tinyUrl].userID !== userId) {
    res.status(401).send("Error 401: Unauthorized Access. TinyURL does not belong to this user.");
  }
  res.render("urls_show", templateVars);
});

/**
 * Directs user to longURL
 * If LongURL does not exist in database gives 404 error
 */
router.get("/u/:id", (req, res) => {
  const tinyUrl = req.params.id;
  const longURL = urlDatabase[tinyUrl].longURL;
  const visitCookie = req.cookies["visitId"];
  if (!longURL) {
    res.status(404).send("Error 404: URL not found");
    return;
  }
  if (!visitCookie) {
    const newVisitor = generateRandomString();
    const timestamp = moment().format("X");
    res.cookie("visitId", newVisitor);
    urlDatabase[tinyUrl].uniqueVisits[newVisitor] = { visitId: newVisitor, time: timestamp };
  }
  urlDatabase[tinyUrl].visits += 1;
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
  const currentDate = moment().format('dddd, MMMM Do YYYY');
  const tinyUrl = generateRandomString();
  const { longURL } =  req.body;
  if (!checkLogin(userId, users)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login");
    return;
  }
  urlDatabase[tinyUrl] = { longURL: longURL, userID: userId, creationDate: currentDate, visits: 0, uniqueVisits: {} };
  res.redirect("/urls/" + tinyUrl);
});

/**
 * Updates longURL from edit form
 */
router.put("/urls/:id", (req, res) => {
  const userId = req.session["userId"];
  const id = req.params.id;
  const { longURL } = req.body;
  const currentDate = moment().format('dddd, MMMM Do YYYY');
  if (!checkLogin(userId, users)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login");
    return;
  }
  if (urlDatabase[req.params.id].userID !== userId) {
    res.status(401).send("Error 401: Unauthorized Access. TinyURL does not belong to this user.");
    return;
  }

  urlDatabase[id].longURL = longURL;
  urlDatabase[id].editDate = currentDate;
  res.redirect("/urls/");
});

/**
 * Delete ShortUrl Entry from DB
 */
router.delete("/urls/:id/delete", (req, res) => {
  const userId = req.session["userId"];
  const tinyUrl = req.params.id;
  if (!checkLogin(userId, users)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login");
    return;
  }
  if (!urlDatabase[tinyUrl]) {
    res.status(400).send("Error 400: TinyUrl does not exist.");
    return;
  }
  if (urlDatabase[tinyUrl].userID !== userId) {
    res.status(401).send("Error 401: Unauthorized Access. TinyURL does not belong to this user.");
  }
  delete urlDatabase[tinyUrl];
  res.redirect("/urls");
});

module.exports = router;