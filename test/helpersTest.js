const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');
const { generateRandomString } = require('../helpers');
const { checkEmailExists } = require('../helpers');
const { urlsForUser } = require('../helpers');

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

const urlTestDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "bbbJ48lW" }
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here

    assert.equal(user, expectedOutput);
  });
  it('should return undefined with a non existing email', function () {
    const user = getUserByEmail("userdoesnotexist@example.com", testUsers);
    const expectedOutput = undefined;
    // Write your assert statement here

    assert.equal(user, expectedOutput);
  });
});

describe('generateRandomString', function () {
  it('should return a length of 6 characters', function () {
    const user = generateRandomString().length;
    const expectedOutput = 6;
    // Write your assert statement here

    assert.equal(user, expectedOutput);
  });

});

describe('checkEmailExists', function () {
  it('should return true if an email exists', function () {
    const user = checkEmailExists('user2@example.com', testUsers);
    const expectedOutput = true;
    // Write your assert statement here

    assert.equal(user, expectedOutput);
  });
  it('should return false if an email does not exist', function () {
    const user = checkEmailExists('user456@example.com', testUsers);
    const expectedOutput = false;
    // Write your assert statement here

    assert.equal(user, expectedOutput);
  });

});

describe('urlsForUser', function () {
  it('should return urls for a specified user', function () {
    const user = urlsForUser('aJ48lW', urlTestDatabase);
    const expectedOutput = { b6UTxQ: "https://www.tsn.ca" };
    // Write your assert statement here

    assert.deepEqual(user, expectedOutput);
  });
  it('should return an empty object if an user does not exist', function () {
    const user = urlsForUser('user456@example.com', testUsers);
    const expectedOutput = {};
    // Write your assert statement here

    assert.deepEqual(user, expectedOutput);
  });

});