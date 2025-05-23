var express = require("express");
var router = express.Router();

const uniqid = require("uniqid");
const fs = require("fs");

router.post("/upload", async (req, res) => {
  if (!req.files || !req.files.photoFromFront) {
    return res.status(400).json({ result: false, error: "No file uploaded" });
  }

  const photoName = `${uniqid()}.jpg`;
  const photoPath = `./tmp/${photoName}`;

  try {
    await req.files.photoFromFront.mv(photoPath);
    res.json({
      result: true,
      tmpPath: photoPath,
      fileName: photoName,
    });
  } catch (err) {
    res.status(500).json({ result: false, error: err.message });
  }
});

module.exports = router;
