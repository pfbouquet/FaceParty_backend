var express = require("express");
var router = express.Router();

const Questions = require("../database/models/Questions");
const Games = require("../database/models/Games");

/* GET questions of an idGame */
router.get("/:gameID", function (req, res) {
  Games.findOne({ _id: req.params.gameID })
    .populate("questions")
    .then((data) => {
      if (data) {
        res.json({
          result: true,
          questions: data.questions,
        });
      } else {
        res.json({ result: false, message: "impossible to access to gameID" });
      }
    })
    .catch((error) => {
      console.log(error.message);
      res.json({
        result: false,
        message: error.message,
      });
    });
});

/* POST answers of a questionID */ // ====>>> à finir une fois la BDD test propre en place
router.post("/answer", function (req, res) {
  Questions.updateOne(
    { _id: req.body.questionID, playerID: req.body.playerID },
    { answer: req.body.answer, answeredAtTime: req.body.answeredAtTime }
  )
    .then((data) => {
      if (data) {
        res.json({ result: true, question: data.answerHistory });
      } else {
        res.json({ result: false, message: "Answers NOT saved" });
      }
    })
    .catch((error) => {
      console.log(error.message);
      res.json({
        result: false,
        message: error.message,
      });
    });
});

module.exports = router;
