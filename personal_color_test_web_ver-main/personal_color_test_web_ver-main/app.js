const express = require("express");
const mysql = require("mysql");
const session = require("express-session");
const MySQLStore = require("express-mysql-session");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const crypto = require("crypto");
const dbConfig = require("./dbConfig");
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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.set("/views", __dirname + "../views");

const indexRouter = require("./routes/index.js");
const mypageRouter = require("./routes/mypage.js");
const pccolorRouter = require("./routes/pccolor_test.js");

const closetRouter = require("./routes/closet.js");
const makeupRouter = require("./routes/makeup.js");

const cmRouter = require("./routes/community_makeup.js");
const ccRouter = require("./routes/community_closet.js");
const ceRouter = require("./routes/community_etc.js");

const closetedit = require("./routes/closet/edit.js");
const closetread = require("./routes/closet/read.js");
const makeupedit = require("./routes/makeup/edit.js");
const makeupread = require("./routes/makeup/read.js");
const etcedit = require("./routes/etc/edit.js");
const etcread = require("./routes/etc/read.js");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use("/images", express.static(path.join(__dirname, "/views/images")));
app.use("/css", express.static(path.join(__dirname, "/views/css")));

app.use("/", indexRouter);
app.use("/mypage", mypageRouter);
app.use("/pccolor_test", pccolorRouter);

app.use("/colorpalette/closet", closetRouter);
app.use("/colorpalette/makeup", makeupRouter);

app.use("/community/makeup", cmRouter);
app.use("/community/closet", ccRouter);
app.use("/community/etc", ceRouter);

app.use("/community/closet/edit", closetedit);
app.use("/community/closet/read", closetread);
app.use("/community/makeup/edit", makeupedit);
app.use("/community/makeup/read", makeupread);
app.use("/community/etc/edit", etcedit);
app.use("/community/etc/read", etcread);

app.get((req, res) => {
  res.status(400);
  res.render("404page");
});

//const server = require("http").createServer(app);

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

conn.on('error', function() {});

const server = app.listen(8080, () => {
  console.log("8080 서버 실행");
});

const io = require("socket.io")(server);

let socket_user = {};
io.sockets.on("connection", (socket) => {
  updateuser();
  socket_user[socket.id] = {
    flag: false,
    color_test: [-1, -1, -1, -1, -1, -1, -1, -1, -1],
    tone: "",
    result: -1,
  };

  const req = socket.request;
  const ip = req.headers["x-forwarede-for"] || req.connection.remoteAddress;
  console.log("회원가입 시도 유저 접속", ip, socket.id, req.ip);
  //console.log(socket_user[socket.id].flag);

  socket.on("mypage_join_duplicate", (socket_id, id) => {
    let sql = "select id from users where id = '" + id + "'";

    conn.query(sql, function (err, row, fields) {
      if (err) {
        console.log(err);
      }
      if (row.length == 1) {
        socket_user[socket.id].flag = false;
      } else {
        socket_user[socket.id].flag = true;
      }

      io.to(socket_id).emit("duplicate_result", {
        result: socket_user[socket.id].flag,
      });
    });
  });

  socket.on("disconnect", () => {
    updateuser();
    delete socket_user[socket.id];
    console.log("삭제 완료");
  });

  //퍼스널컬러 테스트
  const pccolor_test_text = (q_num) => {
    let num = [
      "1. 얼굴색 피부(Skin Tone)은 어떤가요?",
      "2. 볼에 홍조가 있나요?",
      "3. 자외선에 잘 타는 타입인가요?",
      "4. 나의 머리카락 색상은?",
      "5. 나의 눈동자 색상은?",
      "6. 나의 피부 밝기는?",
      "7. 나의 머리카락 굵기는?",
      "8. 나의 머리카락은 윤기가 있나요?",
      "9. 나의 이미지는?",
    ];

    let checklist = {
      0: [
        "1. 노란기가 있는 복숭아 빛 계열 (Yellow Base)",
        "2. 핑크 빛이 도는 붉은 빛 계열 (Blue Base)",
      ],
      1: [
        "1. 홍조가 없거나 미세하여 얼굴 색의 변화를 주지 않는다.",
        "2. 홍조가 심하거나 자주 얼굴에 붉은 홍조가 나타난다.",
      ],
      2: [
        "1. 까맣게 타고 오래 지속된다.",
        "2. 붉게 탔다가 금방 원래 피부로 돌아온다.",
      ],
      3: [
        "1. 밝은 브라운 (Light Brown)",
        "2. 다크 브라운 (Dark Brown)",
        "3. 블랙 (Black)",
      ],
      4: [
        "1. 브라운 계열 (Brown Base)",
        "2. 레드 브라운 계열 (Red Brown Base)",
      ],
      5: [
        "1. 밝은 톤 (Bright Tone)",
        "2. 중간 톤 (Soft Tone)",
        "3. 어두운 톤 (Deep Tone)",
      ],
      6: ["1. 모발이 얇고 가늘다.", "2. 모발이 두껍고 굵다."],
      7: [
        "1. 모발이 윤기가 없고 메마른 편이다.",
        "2. 모발이 윤기가 있고 부드러운 편이다.",
      ],
      8: [
        "1. 부드럽고 여성스럽고 우아한 이미지",
        "2. 눈동자가 또렷하고 도시적인 이미지",
      ],
    };

    let tip = [
      "잘 모르겠다면 목 주변을 살펴보세요! (●부분을 중점으로 보세요) 동양인 이라고 모두 노란 피부는 아니에요. 자연스러운 채광이 있는 곳에서 확인하세요.",
      "잘 모르겠다면 ●부분을 중점으로 보세요. 갑작스런 감정변화나 얼굴의 화끈거림으로 인한 홍조로는 판단하지 마세요! 평상시 쉽게 홍조가 생기는지 생각해 보세요.",
      "피부가 자외선에 쉽게 타고 한달 이상 계속된다면 오래 지속된다로 표기해주세요. (● 부분이 잘 타는지 봐주세요. )",
      "염색을 했을 경우 염색을 하지 않은 원래 머리 두피에 가까운 머리카락으로 색상을 확인해주세요. 잘 모르겠다면 눈썹 색상을 참조해도 됩니다 !(● 부분을 봐주세요)",
      "컬러렌즈를 착용하지 않은 본인의 눈동자색을 확인하세요. 시선을 약간 위로 향하고 거울을 보면 더 쉽게 확인할 수 있습니다. (●부분을 보세요)",
      "보통 피부가 실제보다 어둡다고 생각하시는 분들이 많아요! 아래 톤을 보고 가장 가까운 곳에 체크하세요 (● 부분을 봐주세요)",
      "모발이 얇고 가는지, 두껍고 굵은지 체크해주세요! (●부분을 보세요)",
      "모발에 윤기가 있는 편인지, 퍽퍽하고 메마른 편인지 체크해주세요! (● 부분을 보세요)",
      "본인이 되고 싶은 이미지가 아니라 자신의 객관적인 이미지를 체크하세요. (주변사람들에게 객관적으로 어떤 이미지로 보이는지 물어봐도 좋아요)",
    ];

    return [num[q_num], checklist[q_num], tip[q_num]];
  };

  const pccolor_test = (color_test) => {
    let warm = 0;
    let cool = 0;
    let check = 0;

    // 항목 선택
    for (let i = 0; i < color_test.length; i++) {
      if (i == 3 || i == 5) {
        check += color_test[i];
      } else {
        if (color_test[i] == 0) warm += 1;
        else cool += 1;
      }
    }

    // 결과 진행
    let tone = "";
    let result = 0;
    if (warm > cool) {
      tone = "웜톤";
      if (check >= 2) {
        tone = "가을 " + tone;
        result = 2;
      } else {
        tone = "봄 " + tone;
        result = 0;
      }
    } else {
      tone = "쿨톤";
      if (check >= 2) {
        tone = "겨울 " + tone;
        result = 3;
      } else {
        tone = "여름 " + tone;
        result = 1;
      }
    }
    return [tone, result];
  };

  socket.on("show_question", (socket_id, num, num1, checked_value) => {
    updateuser();
    let q_result = pccolor_test_text(num);
    socket_user[socket.id].color_test[num1] = checked_value;
    console.log(socket_user[socket.id].color_test[num1]);
    //[num[q_num], checklist.q_num, tip[q_num]]
    io.to(socket_id).emit("question_result", {
      q_num: q_result[0],
      q_checklist: q_result[1],
      q_tip: q_result[2],
    });
  });

  socket.on("show_test_result", (socket_id, n, checked_value) => {
    updateuser();
    socket_user[socket.id].color_test[n] = checked_value;
    let test_result = pccolor_test(socket_user[socket.id].color_test);

    io.to(socket_id).emit("send_test_result", {
      tone: test_result[0],
      result: test_result[1],
    });
  });
});
