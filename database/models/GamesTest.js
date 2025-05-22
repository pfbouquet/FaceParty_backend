const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  gameCreatedAtTime: { type: Date, required: true, unique: false },
  roomID: { type: String, required: true, unique: true },
  type: { type: String, default: "multi" },
  players: [
    {
      type: mongoose.Types.ObjectId,
      ref: "playersTests",
    },
  ],
  nbRound: { type: Number },
  questions: [
    {
      type: mongoose.Types.ObjectId,
      ref: "questionsTests",
    },
  ],
});

module.exports = mongoose.models.gamesTests || mongoose.model("gamesTests", gameSchema);
