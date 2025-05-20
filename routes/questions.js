var express = require("express");
var router = express.Router();

const Questions = require("../database/models/Questions");

/* GET questions of an idGame */
router.get("/:idGame", function (req, res) {
  Questions.find().then((data) => {
    res.json({
      result: true,
      data: data,
    });
  });
});

module.exports = router;
