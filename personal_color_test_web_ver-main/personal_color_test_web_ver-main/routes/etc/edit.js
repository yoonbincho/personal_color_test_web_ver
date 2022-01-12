const express = require("express");
const mysql = require("mysql");
const session = require("express-session");
const MySQLStore = require("express-mysql-session");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const crypto = require("crypto");
const dbConfig = require("../../dbConfig");
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

app.use("/images", express.static(path.join(__dirname, "../../views/images")));
app.use("/css", express.static(path.join(__dirname, "../../views/css")));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/:id", function (req, res, next) {
  var id = req.params.id;
  let sql =
    "select id, user_id, title, date_format(date,'%Y-%m-%d %H:%i:%s') date, content, img from etc where id = " +
    id;
  conn.query(sql, id, function (err, row) {
    if (err) console.error(err);
    res.render("community_edit", {
      row: row[0],
      category: "etc",
    });
  });
});

app.post("/:id", function (req, res, next) {
  var id = req.params.id;
  var title = req.body.title;
  var content = req.body.content;
  var img = req.body.image;

  if (img === undefined) {
    img = "";
  }

  let sql =
    "update etc set title = '" +
    title +
    "', " +
    " content = '" +
    content +
    "', img = '" +
    img +
    "' where id =" +
    id;
  conn.query(sql, id, function (err, row) {
    if (err) console.error(err);
  });

  res.send(
    "<script>alert('수정이 완료되었습니다.'); location.href='/community/etc';</script>"
  );
});

conn.on('error', function() {});
