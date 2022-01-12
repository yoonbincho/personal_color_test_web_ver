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

updateuser();

// id, pw 체크
const login = (id, pw) => {
  let len = users.length;

  for (let i = 0; i < len; i++) {
    if (id === users[i].id && pw === users[i].pw) return users[i];
  }

  return "";
};

// const router = express.Router();

app.post("/login", (req, res) => {
  let id = req.body.id;
  let pw = req.body.pw;

  console.log(id + " " + pw);

  updateuser();
  let user = login(id, pw);

  if (user == "") {
    return res.send(
      "<script>alert('로그인 정보를 올바르게 입력하세요.'); location.href='/mypage/login';</script>"
    );
  }
  req.session.user = user;
  req.session.save((err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("<h1>500 error</h1>");
    }
  });
  res.send(
    "<script>alert('정상적으로 로그인 되었습니다.'); location.href='/';</script>"
  );
});

app.get("/", function (req, res) {
  updateuser();
  if (req.session.user === undefined)
    return res.send(
      "<script>alert('로그인 후 이용 가능합니다.'); location.href='/mypage/login';</script>"
    );

  let sql = "select * from users where id = '" + req.session.user.id + "'";

  conn.query(sql, function (err, row, fields) {
    if (err) {
      console.log(err);
    }
    res.render("mypage", {
      row: row[0],
    });
  });
});

app.post("/", function (req, res) {
  if (req.session.user === undefined)
    return res.send(
      "<script>alert('로그인 후 이용 가능합니다.'); location.href='/mypage/login';</script>"
    );

  let pw = req.body.pw;

  let sql =
    "update users set password = '" +
    pw +
    "' where id = '" +
    req.session.user.id +
    "'";
  conn.query(sql, function (err, res, fields) {
    if (err) {
      console.log(err);
    } else {
    }
  });
  res.send(
    "<script>alert('비밀번호 수정이 완료되었습니다.'); location.href='/mypage';</script>"
  );
});

app.get("/login", (req, res) => {
  res.render("mypage_login");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(error);
      return res.status(500).send("<h1>500 error</h1>");
    }
    res.send(
      "<script>alert('로그아웃이 완료되었습니다. 안녕히가세요'); location.href='/';</script>"
    );
  });
});

app.get("/secession", (req, res) => {
  res.render("mypage_secession");
});

app.post("/secession", (req, res) => {
  let pw = req.body.pw;

  if (pw == req.session.user.pw) {
    let sql =
      "delete from users where id = '" +
      req.session.user.id +
      "' and password = '" +
      pw +
      "'";
    conn.query(sql, function (err, res, fields) {
      if (err) {
        console.log(err);
      } else {
      }
    });

    updateuser();

    req.session.destroy((err) => {
      if (err) {
        console.log(error);
        return res.status(500).send("<h1>500 error</h1>");
      }

      res.send(
        "<script>alert('탈퇴가 완료되었습니다. 안녕히가세요'); location.href='/';</script>"
      );
    });
  } else {
    res.send(
      "<script>alert('비밀번호가 일치하지 않습니다.'); location.href='/mypage/secession';</script>"
    );
  }
});

app.get("/join", (req, res) => {
  updateuser();
  res.render("mypage_join");
});

app.post("/join", (req, res) => {
  let id = req.body.id;
  let pw = req.body.pw;
  let name = req.body.name;
  let idcheck = req.body.idcheck;

  console.log(idcheck);

  if (id != "" && pw != "" && name != "" && idcheck == "true") {
    let sql =
      "insert into users values ('" +
      id +
      "', '" +
      pw +
      "', '" +
      name +
      "', '')";
    conn.query(sql, function (err, res, fields) {
      if (err) {
        console.log(err);
      } else {
      }
    });
    updateuser();
    res.send(
      "<script>alert('회원가입이 완료되었습니다.'); location.href='/';</script>"
    );
  } else {
    res.send(
      "<script>alert('입력 란을 다시 확인해주세요.'); location.href='/mypage/join';</script>"
    );
  }
});

app.post("/result", (req, res) => {
  // 로그아웃 된 상태라면
  if (req.session.user === undefined) return res.redirect("/mypage/login");

  console.log(req.body.result2);

  let select = req.body.result2;
  let tone = "";

  if (select == 0) {
    tone = "봄 웜톤";
  } else if (select == 1) {
    tone = "여름 쿨톤";
  } else if (select == 2) {
    tone = "가을 웜톤";
  } else if (select == 3) {
    tone = "겨울 쿨톤";
  } else {
    tone = "";
  }

  let sql =
    "update users set pc_color = '" +
    tone +
    "' where id ='" +
    req.session.user.id +
    "'";
  req.session.user.pc_color = tone;
  updateuser();

  conn.query(sql, function (err, res, fields) {
    if (err) {
      console.log(err);
    }
  });
});
// module.exports = router;

conn.on('error', function() {});