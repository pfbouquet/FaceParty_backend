const mongoose = require("mongoose");
//Schéma collection players MongoDB
const schema = new mongoose.Schema({
  gameID: { type: String, required: true },
  playerName: String,
  user: { type: mongoose.Types.ObjectId, ref: "users" }, //clé étrangère de la collection users pas encore utilisée
  isAdmin: Boolean,
  portraitFilePath: String, // ex: 87hdhe83b.jpg
  scoreHistory: [Number],
  score: Number,
  rank: Number,
  socketID: { type: String, required: true },
});

module.exports = mongoose.models.players || mongoose.model("players", schema);
