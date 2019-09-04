const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


const generateRandomString = () => {
  let randomString = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};
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

app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = { user: users[req.cookies["user_id"]], urls: urlsForUser(req.cookies["user_id"]) };
    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/register", (req, res) => {
  let templateVars = { user: req.cookies["user_id"] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: req.cookies["user_id"] };
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {

  let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);

});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  };

  // urlDatabase[generateRandomString()].longURL = req.body.longURL;
  // let generatedShortURL = Object.keys(urlDatabase).find(key => urlDatabase[key] === req.body.longURL);
  // urlDatabase[generatedShortURL].userID = req.cookies["user_id"];

  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies["user_id"] === urlDatabase[shortURL].userID) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.statusCode = 403;
    res.send(`Error ${res.statusCode} Connot delete someone else's tiny URL`);
  }
});

app.post("/urls/:shortURL", express.urlencoded({ extended: false }), (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies["user_id"] === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.statusCode = 403;
    res.send(`Error ${res.statusCode} Connot edit someone else's tiny URL`);
  }
});

app.post("/logout", express.urlencoded({ extended: false }), (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");

});

const checkEmailExists = (email) => {
  for (let key in users) {
    if (email === users[key].email) {
      return true;
    }
  }
  return false;
};

app.post("/register", express.urlencoded({ extended: false }), (req, res) => {
  let userID = generateRandomString();
  if (req.body.email === "") {
    res.statusCode = 403;
    res.send(`Error ${res.statusCode} Email cannot be blank`);

  }
  if (req.body.password === "") {
    res.statusCode = 403;
    res.send(`Error ${res.statusCode} Password cannot be blank`);

  }

  if (checkEmailExists(req.body.email)) {
    res.statusCode = 403;
    res.send(`Error ${res.statusCode}: Email address already eexists`);
  }

  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: hashedPassword
  };
  res.cookie('user_id', users[userID].id);
  res.redirect("/urls");
});

app.post("/login", express.urlencoded({ extended: false }), (req, res) => {

  if (!checkEmailExists(req.body.email)) {
    res.statusCode = 403;
    res.send(`Error ${res.statusCode}: Email cannot be found`);
  }
  // bcrypt.compareSync(req.body.password, users[key].password);

  for (let key in users) {
    if (req.body.email === users[key].email && bcrypt.compareSync(req.body.password, users[key].password)) {
      res.cookie('user_id', users[key].id);
      res.redirect("/urls");
    } else if (req.body.email === users[key].email && req.body.password !== users[key].password) {
      res.statusCode = 403;
      res.send(`Error ${res.statusCode} Password is incorrect`);
    }
  }
});

const urlsForUser = (id) => {
  let urlsForUserId = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urlsForUserId[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return urlsForUserId;
};
