const mongoose = require("mongoose");

const playerAnswers = mongoose.Schema({
    playerID: {type:mongoose.Schema.Types.ObjectId,ref:'playersTests'},
    playerName: String,
    answer: [String],
    answeredAtTime: Date,
})

const questionsSchema = mongoose.Schema({
  imageUrl: String,
  goodAnswer: [String],
  possibleAnswers: [[String],[String]],
  index: Number,
  askedAtTime: Date,
  answerHistory: playerAnswers,
});

const QuestionsTests = mongoose.model("questionsTests", questionsSchema);

module.exports = QuestionsTests;