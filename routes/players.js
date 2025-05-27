var express = require("express");
var router = express.Router();
const Player = require("../database/models/Players");
const Game = require("../database/models/Games");

router.get("/:gameID", (req, res) => {
  Game.findOne({ _id: req.params.gameID })
    .populate("players")
    .then((data) => {
      if (data) {
        res.json({ result: true, players: data.players });
      } else {
        res.json({ result: false, error: "pas de guaiême" });
      }
    });
});

/* Update player name */
router.put("/updateName", async (req, res) => {
  const { playerID, playerName } = req.body;

  if (!playerID || !playerName) {
    return res.json({
      result: false,
      message: "Missing playerID or playerName",
    });
  }

  try {
    const updateResult = await Player.updateOne(
      { _id: playerID },
      { $set: { playerName: playerName } }
    );

    if (updateResult.modifiedCount === 1) {
      return res.json({
        result: true,
        message: `PlayerName ${playerName} changed`,
      });
    } else {
      return res.json({
        result: false,
        message: "PlayerName NOT changed",
      });
    }
  } catch (error) {
    return res.json({
      result: false,
      message: "Error updating playerName",
      error: error.message,
    });
  }
});

/* Add score to player (increment in score and push score of each question in scoreHistory*/
router.put("/addScore", async (req, res) => {
  const { playerID, score } = req.body;

  if (!playerID || score === undefined) {
    return res.json({
      result: false,
      message: "Missing playerID or score",
    });
  }

  try {
    await Player.updateOne(
      { _id: playerID },
      { $push: { scoreHistory: [score] } }
    );
    const updateResult = await Player.updateOne(
      { _id: playerID },
      { $inc: { score: score } }
    );

    if (updateResult.modifiedCount === 1) {
      return res.json({
        result: true,
        message: `Score added to player ${playerID}`,
      });
    } else {
      return res.json({
        result: false,
        message: "Score NOT added",
      });
    }
  } catch (error) {
    return res.json({
      result: false,
      message: "Error adding score",
      error: error.message,
    });
  }
});

module.exports = router;
