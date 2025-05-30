var express = require("express");
var router = express.Router();
const uid2 = require("uid2");
const { checkBody } = require("../modules/checkBody");
const Game = require("../database/models/Games");
const Player = require("../database/models/Players");
const Character = require("../database/models/Characters");
const { socketJoinRoom } = require("../services/socketRoomManager");

// Function to generate a new unique roomID
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

// GET games/:roomID
router.get("/:roomID", async function (req, res, next) {
  if (!checkBody(req.params, ["roomID"])) {
    console.log("Missing some field in params.");
    console.log(req.params);
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  // Find the party
  let gameData = await Game.findOne({ roomID: req.params.roomID }).populate([
    "players",
    "characters",
  ]);
  if (!gameData) {
    console.log("Game not found");
    res.json({ result: false, error: "Game not found" });
    return;
  }
  res.json({ result: true, game: gameData });
});

// POST games/join
router.post("/join", async function (req, res, next) {
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
    playerName: "New player",
    portraitFilePath: "",
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
  const playerSocket = io.sockets.sockets.get(playerData.socketID);
  if (playerSocket) {
    socketJoinRoom(playerSocket, gameData.roomID);
  } else {
    console.warn(`Socket with ID ${playerSocket} not found`);
  }

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
  try {
    let roomID = await getNewRoomID();

    let newGame = new Game({
      gameCreatedAtTime: Date.now(),
      roomID: roomID,
      type: "multi",
      nbRound: 6, // Default value to 6 to ease tests
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

// DELETE	games/kick-player
router.delete("/kick-player", async function (req, res, next) {
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
    // res is true
    res.json({
      result: true,
      message: "A player has been removed from the game",
    });
  } catch (error) {
    console.error("Error creating game or player:", error);
    res
      .status(500)
      .json({ result: false, error: "Server error", details: error.message });
  }
});

// POST  games/add-character
router.post("/add-character", async function (req, res, next) {

  // Check body
  if (!checkBody(req.body, ["roomID"])) {
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
    // Get new available characters
    let filters = {};
    if (req.body.type) {
      filters.type = req.body.type;
    }
    let characters = await Character.find(filters);
    let gameCharacterIds = gameData.characters.map((id) => id.toString());
    let charactersAvailable = characters.filter(
      (character) => !gameCharacterIds.includes(character._id.toString())
    );
    // Check if at least 1 new available character exists
    if (!charactersAvailable || charactersAvailable.length === 0) {
      res.json({ result: false, error: "No new characters available" });
      return;
    }
    // Pick newCharacter randomly
    let newCharacter =
      charactersAvailable[
        Math.floor(Math.random() * charactersAvailable.length)
      ];

    // Add new character to the party
    gameData.characters.push(newCharacter._id);
    let newGameData = await gameData.save();
    if (!newGameData) {
      res.json({
        result: false,
        error: "Issue adding new character to the game",
      });
      return;
    }

    // Communicate to the room that game composition was updated
    // Get a io instance from the app
    const io = await req.app.get("io");
    // Send event to room socket
    io.to(gameData.roomID).emit("player-update", {
      type: "character-added",
      message: "A new character has been added to the party",
    });
    // Route res success
    res.json({
      result: true,
      newCharacter: newCharacter,
      game: newGameData,
    });
  } catch (error) {
    console.error("Error adding character:", error);
    res
      .status(500)
      .json({ result: false, error: "Server error", details: error.message });
    return;
  }
});

// DELETE  games/kick-character
router.delete("/kick-character", async function (req, res, next) {

  // Check body
  if (!checkBody(req.body, ["roomID", "characterID"])) {
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

    // Remove character from the game
    const updateResult = await Game.updateOne(
      { _id: gameData._id },
      { $pull: { characters: req.body.characterID } }
    );

    if (!updateResult) {
      res.json({
        result: false,
        error: "Issue removing character from the game",
      });
      return;
    }
    if (updateResult.modifiedCount <= 0) {
      res.json({
        result: true,
        error: "Character was not in the game",
      });
      return;
    }
    if (updateResult.modifiedCount > 0) {
      // Communicate to the room that game composition was updated
      // Get a io instance from the app
      const io = await req.app.get("io");
      // Send event to room socket
      io.to(req.body.roomID).emit("player-update", {
        type: "character-removed",
        message: "A character has been removed from the game",
      });
      // res is true
      res.json({
        result: true,
        message: "A character has been removed from the game",
      });
      return;
    }
  } catch (error) {
    console.error("Error removing character:", error);
    res
      .status(500)
      .json({ result: false, error: "Server error", details: error.message });
    return;
  }
});

module.exports = router;
