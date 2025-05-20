const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  gameCreatedAtTime: { type: Date, required: true, unique: false },
  roomID: { type: String, required: true, unique: true },
  type: { type: String, default: "multi" },
  players: [
    {
      type: mongoose.Types.ObjectId,
      ref: "players",
    },
  ],
  nbRound: { type: Number },
  questions: [
    {
      type: mongoose.Types.ObjectId,
      ref: "questions",
    },
  ],
});

module.exports = mongoose.models.games || mongoose.model("games", gameSchema);
