const express = require("express");
const mysql = require("mysql");
const session = require("express-session");
const MySQLStore = require("express-mysql-session");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const crypto = require("crypto");
const dbConfig = require("../dbConfig");
const path = require("path");

const app = (module.exports = express());
const dbOptions = dbConfig;
const conn = mysql.createConnection(dbOptions);
const sessionStore = new MySQLStore(dbOptions);
conn.connect();
app.use(
  session({
    secret: "secret key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/images", express.static(path.join(__dirname, "../views/images")));
app.use("/css", express.static(path.join(__dirname, "../views/css")));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.set("/views", __dirname + "../views");

// const http = require("http");
// const socket = require("socket.io");
// const server = http.createServer(app);
// const io = socket(server);

app.get("/", (req, res) => {
  if (req.session.user === undefined)
    return res.send(
      "<script>alert('로그인 후 이용 가능합니다.'); location.href='/mypage/login';</script>"
    );
  res.render("personalcolor_test");
});

app.get("/test", function (req, res) {
  if (req.session.user === undefined)
    return res.send(
      "<script>alert('로그인 후 이용 가능합니다.'); location.href='/mypage/login';</script>"
    );
  res.render("personalcolor_test_test");
});

app.get("/spring", (req, res) => {
  if (req.session.user === undefined)
    return res.send(
      "<script>alert('로그인 후 이용 가능합니다.'); location.href='/mypage/login';</script>"
    );
  res.render("personalcolor_kind_spring");
});

app.get("/summer", (req, res) => {
  if (req.session.user === undefined)
    return res.send(
      "<script>alert('로그인 후 이용 가능합니다.'); location.href='/mypage/login';</script>"
    );
  res.render("personalcolor_kind_summer");
});

app.get("/autumn", (req, res) => {
  if (req.session.user === undefined)
    return res.send(
      "<script>alert('로그인 후 이용 가능합니다.'); location.href='/mypage/login';</script>"
    );
  res.render("personalcolor_kind_autumn");
});

app.get("/winter", (req, res) => {
  if (req.session.user === undefined)
    return res.send(
      "<script>alert('로그인 후 이용 가능합니다.'); location.href='/mypage/login';</script>"
    );
  res.render("personalcolor_kind_winter");
});

app.get("/result", (req, res) => {
  if (req.session.user === undefined)
    return res.send(
      "<script>alert('로그인 후 이용 가능합니다.'); location.href='/mypage/login';</script>"
    );
  res.render("personalcolor_test_result");
});

conn.on('error', function() {});