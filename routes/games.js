var express = require("express");
var router = express.Router();
const uid2 = require("uid2");
const { checkBody } = require("../modules/checkBody");
const Game = require("../database/models/Games");
const Player = require("../database/models/Players");

async function getNewRoomID() {
  let roomID = uid2(4).toUpperCase();
  let roomIDExists = true;

  // Check that roomID doesn't already exists
  while (roomIDExists) {
    data = await Game.findOne({ roomID: roomID });
    if (data === null) {
      roomIDExists = false;
    } else {
      roomID = uid2(4).toUpperCase();
    }
  }
  return roomID;
}

async function connectPlayerToRoom(io, userSocketID, roomID) {
  const playerSocket = io.sockets.sockets.get(userSocketID);
  if (playerSocket) {
    playerSocket.join(roomID);
    console.log(`Socket ${playerSocket} joined room ${roomID}`);

    // Notify successfull join of the room
    playerSocket.emit("joined-success", {
      message: "You have successfully joined the room!",
      room: roomID,
    });

    // Notify other sockets in the room
    playerSocket.to(roomID).emit("player-joined", {
      socketId: playerSocket.id,
      room: roomID,
    });

    // (Optional) send the current players to the one who just joined
    const socketsInRoom = await io.in(roomID).fetchSockets();
    const socketIds = socketsInRoom.map((s) => s.id);

    playerSocket.emit("room-state", {
      room: roomID,
      currentPlayers: socketIds,
    });
    console.log("Sockets currently in room:", socketIds);
  } else {
    console.warn(`Socket with ID ${playerSocket} not found`);
  }
}

// POST games/join
router.post("/join", async function (req, res, next) {
  if (!checkBody(req.body, ["playerSocketID", "isAdmin", "roomID"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  // Find the party
  let gameData = await Game.findOne({ roomID: req.body.roomID });
  if (!gameData) {
    res.json({ result: false, error: "Game not found" });
    return;
  }

  // Create player
  let newPlayer = new Player({
    gameID: gameData._id,
    isAdmin: req.body.isAdmin,
    socketID: req.body.playerSocketID,
    playerName: "anonymous",
  });
  let playerData = await newPlayer.save();

  // Add player in related game in DB
  gameData.players.push(playerData._id);
  await gameData.save();

  // Connect player socket to game room
  const io = req.app.get("io");
  connectPlayerToRoom(io, playerData.socketID, gameData.roomID);

  // Res
  res.json({
    result: true,
    player: {
      playerID: playerData._id,
      isAdmin: playerData.isAdmin,
      playerName: playerData.playerName,
    },
  });
});

// POST	games/create
router.post("/create", async function (req, res, next) {
  console.log("Route reached: /game/create");

  try {
    let roomID = await getNewRoomID();

    let newGame = new Game({
      gameCreatedAtTime: Date.now(),
      roomID: roomID,
      type: "multi",
      nbRound: 10,
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
      },
    });
  } catch (error) {
    console.error("Error creating game or player:", error);
    res
      .status(500)
      .json({ result: false, error: "Server error", details: error.message });
  }
});

module.exports = router;
