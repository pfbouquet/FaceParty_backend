var express = require("express");
var router = express.Router();
const uid2 = require("uid2");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// POST	game/create
router.post("/create", function (req, res, next) {
  console.log("Creating a new game");
  console.log(uid2(6));
  res.json({ result: true });
});

module.exports = router;
