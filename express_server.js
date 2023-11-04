const express = require("express");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const loginRoutes = require("./routes/login");
const urlRoutes = require("./routes/url");
const urlApiRoutes = require("./routes/url-api");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

/**
 * middleware
 */

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['test-secret-key'],
}));

/**
 * start server
 */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/**
 * Routes
 */
app.use("/", loginRoutes);
app.use("/", urlRoutes);
app.use("/", urlApiRoutes);