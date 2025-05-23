const mongoose = require("mongoose");

const playerAnswers = mongoose.Schema({
  playerID: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
  playerName: String,
  answer: [String],
  answeredAtTime: Date,
});

const questionsSchema = mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "games" },
  imageUrl: String,
  goodAnswers: [String],
  possibleAnswers: [String],
  index: Number,
  askedAtTime: Date,
  answerHistory: playerAnswers,
});

const Questions = mongoose.model("questions", questionsSchema);

module.exports = Questions;
