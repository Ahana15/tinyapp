const { generateRandomString } = require('./helpers');
const { getUserByEmail } = require('./helpers');
const { checkEmailExists } = require('./helpers');
const { urlsForUser } = require('./helpers');

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));


const PORT = 8080; // default port 8080
app.set("view engine", "ejs");


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const users = {};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//   GET /
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// GET /urls
app.get("/urls", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = { user: users[req.session.user_id], urls: urlsForUser(req.session.user_id, urlDatabase) };
    res.render("urls_index", templateVars);
  } else {

    res.redirect('/login');
  }
});

// GET /urls/new
app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

// GET /urls/:id
app.get("/urls/:shortURL", (req, res) => {
  if (users[req.session.user_id]) {
    if (urlDatabase[req.params.shortURL].userID !== users[req.session.user_id].id) {
      res.send(`Unauthorized user`);
    } else {
      let templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
      res.render("urls_show", templateVars);
    }
  } else {
    res.redirect('/login');
  }
});

// GET /u/:id
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.send(`This tiny url does not exists.`);
  }
});

// POST /urls
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

// POST /urls/:id
app.post("/urls/:shortURL", express.urlencoded({ extended: false }), (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    res.statusCode = 403;
    res.send(`Error ${res.statusCode} Connot edit someone else's tiny URL`);
  }
});

// POST /urls/:id/delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.statusCode = 403;
    res.send(`Error ${res.statusCode} Connot delete someone else's tiny URL`);
  }
});

// GET /login
app.get("/login", (req, res) => {
  if (req.session.user_id && users[req.session.user_id] && users[req.session.user_id].email) {
    res.redirect('/urls');
  } else {
    let templateVars = { user: req.session.user_id };
    res.render("urls_login", templateVars);
  }
});

// GET /register
app.get("/register", (req, res) => {
  if (req.session.user_id && users[req.session.user_id] && users[req.session.user_id].email) {
    res.redirect('/urls');
  } else {
    let templateVars = { user: req.session.user_id };
    res.render("urls_register", templateVars);
  }

});


// POST /login
app.post("/login", express.urlencoded({ extended: false }), (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 403;
    res.send(`Error ${res.statusCode} Email/Password cannot be left blank`);
  } else if (!checkEmailExists(req.body.email, users)) {
    res.statusCode = 401;
    res.send(`Error ${res.statusCode}: Email cannot be found`);
  }
  // bcrypt.compareSync(req.body.password, users[key].password);

  for (let key in users) {
    if (req.body.email === users[key].email && bcrypt.compareSync(req.body.password, users[key].password)) {
      req.session.user_id = users[key].id;
      res.redirect("/urls");
    } else if (req.body.email === users[key].email && req.body.password !== users[key].password) {
      res.statusCode = 401;
      res.send(`Error ${res.statusCode} Password is incorrect`);
    }
  }
});

// POST /register
app.post("/register", express.urlencoded({ extended: false }), (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 403;
    res.send(`Error ${res.statusCode} Email/Password cannot be left blank`);
  } else if (checkEmailExists(req.body.email, users)) {
    res.statusCode = 403;
    res.send(`Error ${res.statusCode}: Email address already exists`);
  }

  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString();

  // creating a new user object in USERS oobject

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: hashedPassword
  };
  req.session.user_id = users[userID].id;
  res.redirect("/urls");
});


// POST /logout
app.post("/logout", express.urlencoded({ extended: false }), (req, res) => {
  req.session = null;
  res.redirect("/urls");
});





