const generateRandomString = () => {
  let randomString = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const getUserByEmail = (email, database) => {
  for (let key in database) {
    if (database[key].email === email) {
      return database[key].id;
    }
  }
};

const checkEmailExists = (email, users) => {
  for (let key in users) {
    if (email === users[key].email) {
      return true;
    }
  }
  return false;
};

const urlsForUser = (id, urlDatabase) => {
  let urlsForUserId = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urlsForUserId[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return urlsForUserId;
};

module.exports = { generateRandomString, getUserByEmail, checkEmailExists, urlsForUser };