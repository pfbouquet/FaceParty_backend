const mongoose = require("mongoose");
//schema collection characters (célébrités) dans MongoDB 
const characterSchema = new mongoose.Schema({
  type: String,
  name: String,
  fullName: String,
  portraitFilePath: String,
});

module.exports =
  mongoose.models.characters || mongoose.model("characters", characterSchema);
