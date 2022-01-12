const express = require("express");

const router = express.Router();

router.get("/", function (req, res, next) {
  res.render("index", { title: "What's My Color?" });
});

module.exports = router;
