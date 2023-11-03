const { assert } = require('chai');

const { generateRandomString, getUserByEmail, checkLogin, urlsForUsers } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testURLs = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "test"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "test"
  }
};

describe('generateRandomString', function() {
  it('Should return a string', function() {
    const randomString = generateRandomString();
    assert.isString(randomString);
  });
});

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });
  it('should return a undefined if no user is found', function() {
    const user = getUserByEmail("doesnotexist@example.com", testUsers);
    const expectedUndefined = undefined;
    assert.strictEqual(user, expectedUndefined);
  });
});

describe('checkLogin', function() {
  it('Should return true if user is logged in', function() {
    const userID = "userRandomID";
    const loginCheck = checkLogin(userID, testUsers);
    assert.strictEqual(loginCheck, true);
  });
  it('Should return false if user is not logged in', function() {
    const userID = "";
    const loginCheck = checkLogin(userID, testUsers);
    assert.strictEqual(loginCheck, false);
  });
});

describe('urlsForUsers', function() {
  it('Should return url objects when userId matches', function() {
    const id = "test";
    const tinyUrl = urlsForUsers(id, testURLs);
    assert.deepEqual(tinyUrl, testURLs);
  });
  it('Should return empty object for ID with no matches', function() {
    const id = "fail_Test";
    const tinyUrl = urlsForUsers(id, testURLs);
    assert.deepEqual(tinyUrl, {});
  });
});