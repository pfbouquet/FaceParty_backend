var express = require("express");
var router = express.Router();
const uid2 = require("uid2");
const { checkBody } = require("../modules/checkBody");
const Game = require("../database/models/Games");
const Player = require("../database/models/Players");

async function getNewRoomID() {
  function getRandomCode(min, max) {
    return String(min + Math.floor((max - min) * Math.random())).padStart(
      4,
      "0"
    );
  }

  let roomID = getRandomCode(0, 9999);
  let roomIDExists = true;

  // Check that roomID doesn't already exists
  while (roomIDExists) {
    data = await Game.findOne({ roomID: roomID });
    if (data === null) {
      roomIDExists = false;
    } else {
      roomID = getRandomCode(0, 9999);
    }
  }
  return roomID;
}

async function connectPlayerToRoom(io, userSocketID, roomID) {
  const playerSocket = io.sockets.sockets.get(userSocketID);
  if (playerSocket) {
    playerSocket.join(roomID);

    // Notify successfull join of the room
    playerSocket.emit("joined-success", {
      message: `You have successfully joined the room ${roomID}`,
      room: roomID,
    });

    // Notify other sockets in the room
    // Prepare room information to be shared to the room.
    let gameData = await Game.findOne({ roomID: roomID }).populate("players");
    let partyStatus = {
      gameID: gameData._id,
      roomID: gameData.roomID,
      nbRound: gameData.nbRound,
      players: gameData.players.map((p) => ({
        playerID: p._id,
        playerName: p.playerName,
        isAdmin: p.isAdmin,
      })),
    };

    io.to(roomID).emit("player-update", {
      type: "player-joined",
      message: "New player has joined the roomID party",
      partyStatus: partyStatus,
    });
  } else {
    console.warn(`Socket with ID ${playerSocket} not found`);
  }
}

// POST games/join
router.post("/join", async function (req, res, next) {
  console.log("Route reached: /games/join");
  if (!checkBody(req.body, ["playerSocketID", "isAdmin", "roomID"])) {
    console.log("Missing some field in body.");
    console.log(req.body);
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  // Find the party
  let gameData = await Game.findOne({ roomID: req.body.roomID });
  if (!gameData) {
    console.log("Game not found");
    res.json({ result: false, error: "Game not found" });
    return;
  }

  // Create player
  let newPlayer = new Player({
    gameID: gameData._id,
    isAdmin: req.body.isAdmin,
    socketID: req.body.playerSocketID,
    playerName: "anonymous",
    selfieFilePath: "pathTest",
    scoreHistory: 0,
    score: 0,
    rank: 0,
  });
  let playerData = await newPlayer.save();

  if (!playerData) {
    console.log("Player couldn't be created");
    res.json({ result: false, error: "Player not created" });
    return;
  }

  // Add player in related game in DB
  gameData.players.push(playerData._id);
  let data = await gameData.save();
  if (!data) {
    console.log("Player couldn't be added to the game");
    res.json({ result: false, error: "Player not added to game" });
    return;
  }

  // Connect player socket to game room
  const io = await req.app.get("io");
  connectPlayerToRoom(io, playerData.socketID, gameData.roomID);

  // Res
  res.json({
    result: true,
    player: {
      playerID: playerData._id,
      isAdmin: playerData.isAdmin,
      playerName: playerData.playerName,
    },
    game: {
      gameID: gameData._id.toString(),
      roomID: gameData.roomID,
      nbRound: gameData.nbRound,
    },
  });
});

// POST	games/create
router.post("/create", async function (req, res, next) {
  console.log("Route reached: /games/create");

  try {
    let roomID = await getNewRoomID();

    let newGame = new Game({
      gameCreatedAtTime: Date.now(),
      roomID: roomID,
      type: "multi",
      nbRound: 3, // Default value to 3 to ease tests
    });

    if (req.body.nbRound) {
      newGame.nbRound = req.body.nbRound;
    }
    let gameData = await newGame.save();

    // Res
    res.json({
      result: true,
      message: `Party create with roomID: ${gameData.roomID}`,
      game: {
        gameID: gameData._id,
        roomID: gameData.roomID,
        nbRound: gameData.nbRound,
      },
    });
  } catch (error) {
    console.error("Error creating game or player:", error);
    res
      .status(500)
      .json({ result: false, error: "Server error", details: error.message });
  }
});

// POST	games/kick-player
router.post("/kick-player", async function (req, res, next) {
  console.log("Route reached: /games/kick-player");
  if (!checkBody(req.body, ["playerID", "roomID"])) {
    console.log("Missing some field in body.");
    console.log(req.body);
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  try {
    // Find the party from roomID
    let gameData = await Game.findOne({ roomID: req.body.roomID });
    if (!gameData) {
      console.log("Game not found");
      res.json({ result: false, error: "Game not found" });
      return;
    }
    // Find the player to kick
    let playerData = await Player.findOne({
      _id: req.body.playerID,
      gameID: gameData._id,
    });
    if (!playerData) {
      console.log("Player not found in the game");
      res.json({ result: false, error: "Player not found in the game" });
      return;
    }
    // Remove player from the party
    gameData.players = gameData.players.filter(
      (player) => player.toString() !== req.body.playerID
    );
    await gameData.save();
    // Delete player from DB
    await Player.deleteOne({ _id: req.body.playerID });

    // Get a io instance from the app
    const io = await req.app.get("io");
    // Send communication to player
    const playerSocket = io.sockets.sockets.get(playerData.socketID);
    if (playerSocket) {
      playerSocket.leave(req.body.roomID);
      playerSocket.emit("you-are-kicked", {
        message: "You have been kicked out of the room.",
      });
    }
    // Send comminication to other players in the party
    io.to(req.body.roomID).emit("player-update");
  } catch (error) {
    console.error("Error creating game or player:", error);
    res
      .status(500)
      .json({ result: false, error: "Server error", details: error.message });
  }
});

module.exports = router;
