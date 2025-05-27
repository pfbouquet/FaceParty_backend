var express = require("express");
var router = express.Router();

const uniqid = require("uniqid");
const fs = require("fs");

const Player = require("../database/models/Players");

router.post("/upload", async (req, res) => {
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
      { selfieFilePath: photoName }
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

router.get("/:playerID", async (req, res) => {
  const playerID = req.params.playerID;

  try {
    // Récupère le joueur depuis MongoDB
    const player = await Player.findById(playerID);
    if (!player || !player.selfieFilePath) {
      return res.status(404).json({ result: false, error: "Selfie not found" });
    }
    const selfiePath = `./tmp/${player.selfieFilePath}`;
    if (!fs.existsSync(selfiePath)) {
      return res.status(404).json({ result: false, error: "Selfie file does not exist" });
    }
    res.sendFile(selfiePath, { root: "." });
  } catch (err) {
    res.status(500).json({ result: false, error: err.message });
  }
}
);

module.exports = router;
