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

module.exports = router;
