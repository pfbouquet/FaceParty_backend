const mongoose = require("mongoose");
//Schéma collection questions dans MongoDB
const playerAnswers = mongoose.Schema({
  playerID: { type: mongoose.Schema.Types.ObjectId, ref: "players" }, //clé étrangère players
  playerName: String,
  answer: [String],
  answeredAtTime: Date,
});

const questionSchema = mongoose.Schema({
  gameID: { type: mongoose.Schema.Types.ObjectId, ref: "games" }, //clé étrangère games
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
