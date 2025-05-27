const mongoose = require("mongoose");

const playerAnswers = mongoose.Schema({
  playerID: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
  playerName: String,
  answer: [String],
  answeredAtTime: Date,
});

const questionSchema = mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "games" },
  type: String,
  imageURL: String,
  goodAnswers: [String],
  possibleAnswers: [String],
  index: Number,
  askedAtTime: Date,
  answerHistory: playerAnswers,
});

const Question = mongoose.model("questions", questionSchema);

module.exports = Question;
