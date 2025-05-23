var express = require("express");
var router = express.Router();

const uniqid = require("uniqid");
const fs = require("fs");

router.post("/upload", async (req, res) => {
  const photoName = `${uniqid()}.jpg`;
  const photoPath = `./tmp/${photoName}`;
  const resultMove = await req.files.photoFromFront.mv(photoPath);

  if (!resultMove) {
    res.json({
      result: true,
      tmpPath: photoPath,
      fileName: photoName,
    });
  } else {
    res.json({ result: false, error: resultMove });
  }
});

module.exports = router;
