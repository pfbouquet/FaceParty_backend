const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  gameID: { type: String, required: true },
  playerName: String,
  user: { type: mongoose.Types.ObjectId, ref: "users" },
  isAdmin: Boolean,
  selfieFilePath: String,
  scoreHistory: Number,
  score: Number,
  rank: Number,
  socketID: { type: String, required: true },
});

module.exports = mongoose.models.players || mongoose.model("players", schema);
