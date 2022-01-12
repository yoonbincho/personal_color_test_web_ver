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

app.get("/insert", (req, res) => {
  if (req.session.user === undefined) {
    return res.send(
      "<script>alert('로그인 후 이용 가능합니다.'); location.href='/mypage/login';</script>"
    );
  }
  res.render("community_post");
});

app.post("/insert", (req, res) => {
  let title = req.body.title; // 글 제목
  let content = req.body.content; // 글 내용
  let image = "";
  if (req.body.image === undefined) {
    image = "";
  } else {
    image = req.body.image;
  }

  if (title == "" || content == "") {
    return res.send(
      "<script>alert('제목과 내용을 입력해주세요!'); location.href='/community/makeup/insert';</script>"
    );
  } else if (req.session.user.id === undefined) {
    return res.send(
      "<script>alert('로그인 후 이용 가능합니다.'); location.href='/mypage/login';</script>"
    );
  } else {
    let sql =
      "insert into makeup(user_id, title, date, content, img) values ('" +
      req.session.user.id +
      "', '" +
      title +
      "', now(), '" +
      content +
      "', '" +
      image +
      "')";

    conn.query(sql, function (err, res, fields) {
      if (err) {
        console.log(err);
      } else {
        console.log("insert 성공!");
      }
    });

    return res.send(
      "<script>alert('작성이 완료되었습니다.'); location.href='/community/makeup/1';</script>"
    );
  }
});

let mainsql = "";
app.get("/", (req, res) => {
  mainsql =
    "select id, user_id, title, date_format(date,'%Y-%m-%d %H:%i:%s') date, content, img from makeup order by id desc";

  res.redirect("/community/makeup/1");
});

app.post("/", (req, res) => {
  var search = req.body.search;
  var sw = req.body.sw;
  let page = 1;

  console.log(search);
  console.log(sw);

  if (search == "user" && sw != "") {
    mainsql =
      "select id, user_id, title, date_format(date,'%Y-%m-%d %H:%i:%s') date, content, img  from makeup where user_id like '%" +
      sw +
      "%' order by id desc";
  } else if (search == "title" && sw != "") {
    mainsql =
      "select id, user_id, title, date_format(date,'%Y-%m-%d %H:%i:%s') date, content, img  from makeup where title like '%" +
      sw +
      "%' order by id desc";
  } else {
    mainsql =
      "select id, user_id, title, date_format(date,'%Y-%m-%d %H:%i:%s') date, content, img from makeup order by id desc";
  }

  // conn.query(mainsql, function (err, rows, fields) {
  //   if (err) {
  //     console.log(err);
  //     res.render("index");
  //   }
  //   res.render("community_makeup", {
  //     rows: rows,
  //     page: page,
  //     length: rows.length - 1,
  //     page_num: 10,
  //     pass: true,
  //   });
  //   console.log(rows.length - 1);
  // });

  res.redirect("/community/makeup/1");
});

app.get("/:page", (req, res) => {
  let page = req.params.page;

  if (mainsql == "") {
    mainsql =
      "select id, user_id, title, date_format(date,'%Y-%m-%d %H:%i:%s') date, content, img from makeup order by id desc";
      console.log("if");
    res.redirect("/community/makeup/1");
  }
  
  else {conn.query(mainsql, function (err, rows, fields) {
    if (err) {
      console.log(err);
      res.render("index");
    }
    res.render("community_makeup", {
      rows: rows,
      page: page,
      length: rows.length - 1,
      page_num: 10,
      pass: true,
    });
    console.log("else");
    console.log(rows.length - 1);
  });
  }

});

// app.get("/read/:id", function (req, res, next) {
//   let id = req.params.id;
//   let sql =
//     "select id, user_id, title, date_format(date,'%Y-%m-%d %H:%i:%s') date, content, img from makeup where id = " +
//     id;
//   conn.query(sql, [id], function (err, row) {
//     if (err) console.error(err);
//     res.render("community_view_image", {
//       row: row[0],
//       category: "makeup",
//       writeuser: req.session.user.id,
//     });
//   });
// });

// app.get("/edit/:id", function (req, res, next) {
//   var id = req.params.id;
//   let sql =
//     "select id, user_id, title, date_format(date,'%Y-%m-%d %H:%i:%s') date, content, img from makeup where id = " +
//     id;
//   conn.query(sql, id, function (err, row) {
//     if (err) console.error(err);
//     res.render("community_edit", {
//       row: row[0],
//       category: "makeup",
//     });
//   });
// });

// app.post("/edit/:id", function (req, res, next) {
//   var id = req.params.id;
//   var title = req.body.title;
//   var content = req.body.content;
//   var img = req.body.image;

//   if (img === undefined) {
//     img = "";
//   }

//   let sql =
//     "update makeup set title = '" +
//     title +
//     "', " +
//     " content = '" +
//     content +
//     "', img = '" +
//     img +
//     "' where id =" +
//     id;
//   conn.query(sql, id, function (err, row) {
//     if (err) console.error(err);
//   });

//   res.send(
//     "<script>alert('수정이 완료되었습니다.'); location.href='/community/makeup';</script>"
//   );
// });

app.get("/delete/:id", function (req, res, next) {
  var id = req.params.id;

  let sql = "delete from makeup where id = " + id;
  conn.query(sql, id, function (err, row) {
    if (err) console.error(err);
  });

  res.send(
    "<script>alert('삭제가 완료되었습니다. '); location.href='/community/makeup';</script>"
  );
});

conn.on('error', function() {});
