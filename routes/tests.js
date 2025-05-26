var express = require("express");
var router = express.Router();
const { getMorph } = require("../services/getMorph.js");
const { handleStartGame } = require("../services/gameService.js");

/* GET /tests/testmorph */
router.get("/testmorph", async function (req, res, next) {
  console.log("Route reached /tests/testmorph");
  let testMorphData = await getMorph(
    "./tmp/test/BradPitt.jpg",
    "./tmp/test/DwayneJohnson.jpg"
  );
  if (!testMorphData || !testMorphData.result) {
    return res.json({ result: false, error: "No data; Problem uncontered" });
  }
  res.json({ result: true, testMorphData: testMorphData });
});

/* GET /tests/teststart */
router.get("/teststart", async function (req, res, next) {
  console.log("Route reached /tests/teststart");
  let questions = await handleStartGame("TEST");
  res.json({ result: true, startData: questions });
});

module.exports = router;
