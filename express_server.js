const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

// Global Functions
function generateRandomString() {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = '';
  for (let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

function checkIfRegistered(email) {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user].id;
    }
  } return false;
}

function urlsForUser(id) {
  let userDataBaseURLs = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userDataBaseURLs[url] = urlDatabase[url];
    }
  }
  return userDataBaseURLs;
}

// Global Database
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "1234"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// APP
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// HTTP GET
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userDatabase = urlsForUser(req.cookies["user_id"]);
  const templateVars = { 
    urls: userDatabase,
    user: users[req.cookies["user_id"]] 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userDatabase = urlsForUser(req.cookies["user_id"]);
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]],
    loggedInID: userDatabase[req.params.shortURL].userID
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.send(302);
  } else {
    res.redirect(longURL);
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_user_registration", templateVars);
})

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_login", templateVars);
});

// HTTP POST
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies["user_id"];
  const userUrls = urlsForUser(userID);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send(401);
  }
});

app.post("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const userUrls = urlsForUser(userID);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.send(401);
  }
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = checkIfRegistered(userEmail);
  if (!userID) {
    res.send(403, "Unregistered email address");
  } else {
    if (!bcrypt.compareSync(userPassword, users[userID].password)) {
      res.send(403, "Invalid password, try again");
    } else {
      res.cookie('user_id', userID);
      res.redirect("/urls");
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (userEmail === '' || !userEmail || userPassword === '' || !userPassword) {
    res.send(400, "Invalid Username or Password");
  } else if (checkIfRegistered(userEmail)){
    res.send(400, "Account already exists");
  }
  else(
    users[userID] = {
      id: userID,
      email: userEmail,
      password: bcrypt.hashSync(userPassword, 10)
    }
  );
  console.log(users);
  res.cookie('user_id', userID);
  res.redirect('/urls');
});

