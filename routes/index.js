var express = require("express");
var router = express.Router();
const { getTestMorph } = require("../services/getMorph.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* GET home page. */
router.get("/testmorph", async function (req, res, next) {
  let data = await getTestMorph();
  console.log("data", data);
  if (!data || !data.result) {
    return res.json({ result: false, error: "No data" });
  }
  res.json({ result: true, data: data });
});

module.exports = router;
