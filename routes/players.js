var express = require("express");
var router = express.Router();
const Player = require("../database/models/players");
const Game = require("../database/models/games");


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
    const updateResult = await Player.updateOne({ _id: playerID }, { $set: { playerName: playerName } });

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

module.exports = router;
