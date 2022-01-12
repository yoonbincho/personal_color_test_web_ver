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
  if (req.session.user === undefined) {
    return res.send(
      "<script>alert('로그인 후 이용 가능합니다.'); location.href='/mypage/login';</script>"
    );
  }
  let id = req.params.id;

  console.log(id);
  let sql =
    "select id, user_id, title, date_format(date,'%Y-%m-%d %H:%i:%s') date, content, img from etc where id = " +
    id;
  conn.query(sql, [id], function (err, row) {
    if (err) console.error(err);
    res.render("community_view_image", {
      row: row[0],
      category: "etc",
      writeuser: req.session.user.id,
    });
  });
});

conn.on('error', function() {});
