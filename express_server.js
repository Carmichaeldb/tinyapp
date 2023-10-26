const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = {greeting: "Hello World!"};
  res.render('hello_world', templateVars);
});

/**
 * Renders users My URLs page
 */

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

/**
 * Renders Create New URL page
 */

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

/**
 * Recieve new URL from form
 * Generate random string
 * Insert longURL with new random string as key
*/
app.post("/urls", (req, res) => {
  const tinyUrl = generateRandomString();
  const { longURL } =  req.body; //
  urlDatabase[tinyUrl] = longURL;
  
  res.redirect("/urls/" + tinyUrl);
});

/**
 * Renders TinyURL Information
 * if TinyURL does not exist in database gives 400 error
 */
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Error 400: TinyUrl does not exist");
    return;
  }
  res.render("urls_show", templateVars);
});

/**
 * Directs user to longURL
 * If LongURL does not exist in database gives 404 error
 */
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.status(404).send("Error 404: URL not found");
    return;
  }
  res.redirect(longURL);
});

/**
 * Delete ShortUrl Entry from DB
 */
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

/**
 * Generates random 6 character string
 */
const generateRandomString = function () {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const random = Math.floor(Math.random() * characters.length);
    result += characters[random];
  }
  return result;
};