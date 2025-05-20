var express = require("express");
var router = express.Router();
const uid2 = require("uid2");
const { checkBody } = require("../modules/checkBody");
const Game = require("../database/models/Game");

const getNewInvitationCode = async () => {
  let invitationCode = uid2(6).toUpperCase();
  let invitationCodeExists = true;

  // Check that invitationCode doesn't already exists
  while (invitationCodeExists) {
    data = await Game.findOne({ invitationCode: invitationCode });
    if (data === null) {
      invitationCodeExists = false;
    } else {
      invitationCode = uid2(6).toUpperCase();
    }
  }
  return invitationCode;
};

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// POST	game/create
router.post("/create", async function (req, res, next) {
  console.log("Route reached: /game/create");
  invitationCode = await getNewInvitationCode();

  let newGame = new Game({
    gameCreatedAtTime: Date.now(),
    invitationCode: invitationCode,
    type: "multi",
    nbRound: 10,
    roomSocketID: "roomSocketID",
  });

  if (req.body.nbRound) {
    newGame.nbRound = req.body.nbRound;
  }

  newGame
    .save()
    .then((data) => {
      res.json({
        result: true,
        message: `Party created with invitationCode: ${invitationCode}`,
        invitationCode: invitationCode,
        gameCreatedAtTime: data.gameCreatedAtTime,
      });
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
