var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Character = require("../database/models/Characters");

const allowedCharacterTypes = ["celebrity"];

/* List characters in DB */
router.get("/", (req, res) => {
  Character.find().then((data) => {
    if (data) {
      res.json({ result: true, characters: data });
    } else {
      res.json({ result: false, error: "no characters" });
    }
  });
});

/* Create a new character */
router.post("/new", async (req, res) => {
  // Check the body
  if (!checkBody(req.body, ["name", "portraitFilePath"])) {
    console.log("Missing some field in body.");
    console.log(req.body);
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Make sure type is in valid types
  if (req.body.type) {
    if (!allowedCharacterTypes.includes(req.body.type)) {
      console.log("Invalid type provided.");
      res.json({ result: false, error: "Invalid type provided" });
      return;
    }
  }

  // Check that a character with same name doesn't exists already
  const existingCharacterName = await Character.findOne({
    name: req.body.name,
  });
  if (existingCharacterName) {
    console.log("Character with this name already exists.");
    res.json({
      result: false,
      error: "Character with this name already exists",
    });
    return;
  }

  // Check that a character with same portrait doesn't exists already
  const existingCharacterPortrait = await Character.findOne({
    portraitFilePath: req.body.portraitFilePath,
  });
  if (existingCharacterPortrait) {
    console.log("Character with this portraitFilePath already exists.");
    res.json({
      result: false,
      error: "Character with this portraitFilePath already exists",
    });
    return;
  }

  // Insert new character
  const newCharacter = new Character({
    type: req.body.type || "celebrity", // Default type is 'celebrity'
    name: req.body.name,
    fullName: req.body.fullName || req.body.name,
    portraitFilePath: req.body.portraitFilePath,
  });
  try {
    const characterData = await newCharacter.save();
    res.json({
      result: true,
      message: "Character created successfully",
      character: characterData,
    });
  } catch (error) {
    console.error("Error saving character:", error);
    res.json({
      result: false,
      error: "Error saving character",
      details: error.message,
    });
  }
});

module.exports = router;
