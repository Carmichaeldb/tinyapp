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

const getUserByEmail = function (email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return;
};

/**
 * Check login status
 */

const checkLogin = function (cookieUserId, database) {
  if (database[cookieUserId]) {
    return true;
  }
  return false;
};

/**
 * Filter urls by user
 */

const urlsForUsers = function(id, database) {
  const result = {};
  const data = database;
  for (let key in data) {
    if (data[key].userID === id) {
      result[key] = data[key];
    }
  }
  return result;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  checkLogin,
  urlsForUsers
};