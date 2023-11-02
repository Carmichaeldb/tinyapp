const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

/**
 * Global Vars
 */

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "test"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "test"
  }
};
const testUserPass = bcrypt.hashSync("1234", 10);
const users = { "test": {
  id: "test",
  email: "test@testemail.com",
  password: testUserPass
}};

/**
 * middleware
 */

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * start server
 */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  const userId = req.cookies["userId"];
  if (checkLogin(userId)) {
    res.redirect("/urls");
    return;
  }
  res.redirect("/login");
});

/**
 * Renders Reigstration Page
 */

app.get("/register", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = { username: users[userId] };
  if (checkLogin(userId)) {
    res.redirect("/urls");
    return;
  }
  res.render("register", templateVars);
});

/**
 * Recieve registration form data and store in Users Object
 */

app.post("/register", (req, res) => {
  const newUserId = generateRandomString();
  const newPassword = bcrypt.hashSync(req.body.password, 10);
  const newUser = {id: newUserId, email: req.body.email, password: newPassword };
  const emailSearch = getUsersByEmail(newUser.email);
  if (newUser.email === "" || newUser.password === "") {
    res.status(400).send("Error 400: No Email or Password provided");
    return;
  } if (emailSearch !== null) {
    res.status(400).send("Error 400: Email already in use");
    return;
  }
  users[newUserId] = newUser;
  res.cookie("userId", newUserId);
  res.redirect("/urls");
});

/**
 * Renders Login Page
 */

app.get("/login", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = { username: users[userId] };
  if (checkLogin(userId)) {
    res.redirect("/urls");
    return;
  }
  res.render("login", templateVars);
});

/**
 * Recieves login requests
 */

app.post("/login", (req, res) => {
  const userLogin = { email: req.body.email, password: req.body.password };
  const emailSearch = getUsersByEmail(userLogin.email);
  const passwordCheck = bcrypt.compareSync(userLogin.password, users[emailSearch].password);
  if (emailSearch === null) {
    res.status(400).send("Error 400: Email does not exist");
    return;
  }
  if (!passwordCheck) {
    res.status(400).send("Error 400: invalid password");
    return;
  }
  res.cookie("userId", users[emailSearch].id);
  res.redirect("/urls");
});

/**
 * provides urls JSON database
 */

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/**
 * Renders users My URLs page
 */

app.get("/urls", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = {
    username: users[userId],
    urls: urlsForUsers(userId) };
  if (!checkLogin(userId)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login");
    return;
  }
  res.render('urls_index', templateVars);
});

/**
 * Renders Create New URL page
 */

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = {username: users[userId]};
  if (!checkLogin(userId)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login");
    return;
  }
  res.render("urls_new", templateVars);
});

/**
 * Recieve new URL from new url form
 * Generate random string
 * Insert longURL with new random string as key
*/
app.post("/urls", (req, res) => {
  const userId = req.cookies["userId"];
  if (!checkLogin(userId)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login");
    return;
  }
  const tinyUrl = generateRandomString();
  const { longURL } =  req.body;
  urlDatabase[tinyUrl] = { longURL: longURL, userID: userId };
  
  res.redirect("/urls/" + tinyUrl);
});

/**
 * Renders TinyURL Information
 * if TinyURL does not exist in database gives 400 error
 */
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = { id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    username: users[userId]};
  if (!urlDatabase[req.params.id]) {
    res.status(400).send("Error 400: TinyUrl does not exist.");
    return;
  }
  if (!checkLogin(userId)) {
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
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.status(404).send("Error 404: URL not found");
    return;
  }
  res.redirect(longURL);
});

/**
 * Updates longURL from edit form
 */
app.post("/urls/:id", (req, res) => {
  const userId = req.cookies["userId"];
  if (!checkLogin(userId)) {
    res.status(401).send("Error 401: Unauthorized Access. Please Login");
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
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies["userId"];
  if (!checkLogin(userId)) {
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


/**
 * Recieves logout requests
 */
app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/login");
});

//////////////////////////////////////
//HELPER FUNCTIONS
/////////////////////////////////////
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

/**
 * Search for user by email
 */

const getUsersByEmail = function (email) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return null;
};

/**
 * Check login status
 */

const checkLogin = function (cookieUserId) {
  if (users[cookieUserId]) {
    return true;
  }
  return false;
};

/**
 * Filter urls by user
 */

const urlsForUsers = function(id) {
  const result = {};
  const data = urlDatabase;
  for (let key in data) {
    if (data[key].userID === id) {
      result[key] = data[key];
    }
  }
  return result;
};