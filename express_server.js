const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
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
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  let generatedShortURL = Object.keys(urlDatabase).find(key => urlDatabase[key] === req.body.longURL);
  res.redirect(`/urls/${generatedShortURL}`);
});

app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", express.urlencoded({ extended: false }), (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);

});

app.post("/urls/:shortURL", express.urlencoded({ extended: false }), (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/`);

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
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', users[userID].id);
  res.redirect("/urls");
});

app.post("/login", express.urlencoded({ extended: false }), (req, res) => {

  if (!checkEmailExists(req.body.email)) {
    res.statusCode = 403;
    res.send(`Error ${res.statusCode}: Email cannot be found`);
  }

  for (let key in users) {
    if (req.body.email === users[key].email && req.body.password === users[key].password) {
      res.cookie('user_id', users[key].id);
      res.redirect("/urls");
    } else if (req.body.email === users[key].email && req.body.password !== users[key].password) {
      res.statusCode = 403;
      res.send(`Error ${res.statusCode} Password is incorrect`);
    }
  }
});
