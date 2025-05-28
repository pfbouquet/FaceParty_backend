const mongoose = require("mongoose");

const characterSchema = new mongoose.Schema({
  type: String,
  name: String,
  fullName: String,
  portraitFilePath: String,
});

module.exports =
  mongoose.models.characters || mongoose.model("characters", characterSchema);
