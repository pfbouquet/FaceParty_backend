const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    gameID: {type: String, required: true, unique: true},
    playerName: {type: String, required: true, unique: true},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    isAdmin: {Boolean},
    selfieFilePath: {type: String, required: true, unique: true},
    scoreHistory: {Number},
    score: {Number},
    rank: {Number},
    socketId: {type: String, required: true, unique: true},


});

module.exports = mongoose.models.players || mongoose.model("players", schema);