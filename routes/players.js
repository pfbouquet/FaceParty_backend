var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Player = require("../database/models/Players");
const Game = require("../database/models/Games");

router.get("/:gameID", (req, res) => {
  Game.findOne({ _id: req.params.gameID })
    .populate("players")
    .then((data) => {
      if (data) {
        res.json({ result: true, players: data.players });
      } else {
        res.json({ result: false, error: "pas de game" });
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

/* POST /players/update-admin */
router.post("/update-admin", async (req, res) => {
  if (!checkBody(req.body, ["roomID", "playerID", "isAdmin"])) {
    console.log("Missing some field in params.");
    console.log(req.params);
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  try {
    // Get player
    const playerData = await Player.findById(req.body.playerID);
    if (!playerData) {
      return res.json({
        result: false,
        error: "Player not found in given room",
      });
    }
    // Update player isAdmin
    const updateResult = await Player.updateOne(
      { _id: req.body.playerID },
      { $set: { isAdmin: req.body.isAdmin } }
    );
    if (updateResult.modifiedCount === 0) {
      // nothing actually changed
      return res.json({
        result: true,
        warning: "isAdmin was already set to that value",
      });
    }
    // Success
    const io = await req.app.get("io");
    // Send communication to player
    const playerSocket = io.sockets.sockets.get(playerData.socketID);
    if (playerSocket) {
      playerSocket.emit("update-admin", {
        isAdmin: req.body.isAdmin,
      });
    }
    // Send comminication to other players in the party
    io.to(req.body.roomID).emit("player-update");

    return res.json({ result: true });
  } catch (err) {
    console.error("Error in /players/update-admin:", err);
    return res.status(500).json({
      result: false,
      error: "Internal server error",
    });
  }
});

/* Update-clear scores for all players in a game when relaunch a party */
router.put("/clearScores/:gameID", async (req, res) => {
  const gameID = req.params.gameID;

  if (!gameID) {
    return res.json({
      result: false,
      message: "Missing gameID",
    });
  }

  try {
    const game = await Game.findById(gameID);

    if (!game) {
      return res.json({
        result: false,
        message: "Game not found",
      });
    }

    const updateResult = await Player.updateMany(
      { gameID: gameID },
      { score: 0 }
    );

    return res.json({
      result: true,
      message: `${updateResult.modifiedCount} player scores reset`,
    });
  } catch (error) {
    return res.json({
      result: false,
      message: "Error clearing scores",
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
