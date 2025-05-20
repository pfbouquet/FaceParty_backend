const mongoose = require("mongoose");

const playerAnswers = mongoose.Schema({
    playerID: {type:mongoose.Schema.Types.ObjectId,ref:'players'},
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

const Questions = mongoose.model("questions", questionsSchema);

module.exports = Questions;