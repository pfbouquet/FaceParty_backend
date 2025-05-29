var express = require("express");
var router = express.Router();

const { checkBody } = require("../modules/checkBody");
const uniqid = require("uniqid");
const fs = require("fs");

const Player = require("../database/models/Players");
const Character = require("../database/models/Characters");

router.post("/upload", async (req, res) => {
  console.log("Route reached: POST /portrait/upload");
  if (!req.files || !req.files.photoFromFront) {
    return res.status(400).json({ result: false, error: "No file uploaded" });
  }

  const photoName = `${uniqid()}.jpg`;
  const photoPath = `./tmp/${photoName}`;

  try {
    // Déplace le fichier dans le dossier tmp
    await req.files.photoFromFront.mv(photoPath);

    // 🔧 Récupère l'ID du joueur depuis une query ou body
    const playerID = req.body.playerID; // ou req.query.playerID

    // 🔧 Mets à jour le joueur dans MongoDB
    const updateResult = await Player.updateOne(
      { _id: playerID },
      { portraitFilePath: photoName }
    );

    res.json({
      result: true,
      fileName: photoName,
      updateResult,
    });
  } catch (err) {
    res.status(500).json({ result: false, error: err.message });
  }
});

router.get("/:type/:id", async (req, res) => {
  console.log("Route reached: GET /portrait/:type/:id");
  if (!checkBody(req.params, ["type", "id"])) {
    console.log("Missing some field in params.");
    console.log(req.params);
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  try {
    if (req.params.type === "player") {
      // For players
      // Get player data from DB
      const playerData = await Player.findById(req.params.id);
      if (!playerData || !playerData.portraitFilePath) {
        return res
          .status(404)
          .json({ result: false, error: "Portrait not found" });
      }
      const portraitPath = `./tmp/${playerData.portraitFilePath}`;
      if (!fs.existsSync(portraitPath)) {
        return res
          .status(404)
          .json({ result: false, error: "Portrait file does not exist" });
      }
      res.sendFile(portraitPath, { root: "." });
    } else if (req.params.type === "character") {
      // For characters
      // Get character data from DB
      const characterData = await Character.findById(req.params.id);
      if (!characterData || !characterData.portraitFilePath) {
        return res
          .status(404)
          .json({ result: false, error: "Portrait not found" });
      }
      const portraitPath = `./public/characters/${characterData.portraitFilePath}`;
      if (!fs.existsSync(portraitPath)) {
        return res
          .status(404)
          .json({ result: false, error: "Portrait file does not exist" });
      }
      res.sendFile(portraitPath, { root: "." });
    } else {
      return res.status(404).json({
        result: false,
        error:
          "Type unknown. Available types should be one of {player;character}.",
      });
    }
  } catch (err) {
    res.status(500).json({ result: false, error: err.message });
  }
});

module.exports = router;
