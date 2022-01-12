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

let users = [];
let sql = "select * from users";

function updateuser() {
  conn.query(sql, function (err, res, fields) {
    if (err) {
      console.log(err);
    } else {
      if (res.length != 0) {
        for (let i = 0; i < res.length; i++) {
          users.push({
            id: res[i].id,
            pw: res[i].password,
            name: res[i].name,
            pc_color: res[i].pc_color,
          });
        }
        //console.log(users);
      }
    }
  });
}

app.get("/", (req, res) => {
  res.render("colorpalette_makeup_spring");
});

app.get("/spring", (req, res) => {
  res.render("colorpalette_makeup_spring");
});

app.get("/summer", (req, res) => {
  res.render("colorpalette_makeup_summer");
});

app.get("/autumn", (req, res) => {
  res.render("colorpalette_makeup_autumn");
});

app.get("/winter", (req, res) => {
  res.render("colorpalette_makeup_winter");
});

conn.on('error', function() {});