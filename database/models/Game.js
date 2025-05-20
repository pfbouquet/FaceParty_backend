const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  gameCreatedAtTime: { type: Date, required: true, unique: false },
  invitationCode: { type: String, required: true, unique: true },
  type: { type: String, required: false, unique: false, default: "multi" },
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
  roomSocketID: { type: String, required: true },
});

module.exports = mongoose.models.games || mongoose.model("games", gameSchema);
