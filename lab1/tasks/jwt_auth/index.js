const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SECRET = "top_secret_xgsnhte3";

const EXPIRATION_TIME = "1h";
const SESSION_KEY = "Authorization";

function validateAndGetUser(token) {
  if (!token) return null;

  const data = jwt.verify(token, SECRET);
  if (!data) return null;

  const user = users.find((u) => u.login === data.login);
  return user ? user.username : null;
}

app.use((req, res, next) => {
  const sessionId = req.get(SESSION_KEY);

  req.username = validateAndGetUser(sessionId);
  req.sessionId = sessionId;

  next();
});

app.get("/", (req, res) => {
  if (req.username) {
    return res.json({
      username: req.username,
      logout: "http://localhost:3000/logout",
    });
  }
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/logout", (req, res) => {
  res.redirect("/");
});

const users = [
  {
    login: "login",
    password: "1111",
    username: "Username",
  },
  {
    login: "kotenko2002",
    password: "1111",
    username: "Dmytro Kotenko",
  },
];

app.post("/api/login", (req, res) => {
  const { login, password } = req.body;

  const user = users.find(
    (user) => user.login == login && user.password == password
  );

  if (user) {
    const token = jwt.sign(
      {
        login: user.login,
      },
      SECRET,
      {
        expiresIn: EXPIRATION_TIME,
      }
    );

    console.log("JWT: " + token);
    res.json({ token });
    return;
  }

  res.status(401).send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
