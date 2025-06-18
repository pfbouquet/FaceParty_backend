const mongoose = require("mongoose");
//Schéma collection games dans MongoDB
const gameSchema = new mongoose.Schema({
  gameCreatedAtTime: { type: Date, required: true, unique: false }, //date pas forcément unique
  roomID: { type: String, required: true, unique: true }, //requis et doit être unique
  type: { type: String, default: "multi" },
  players: [
    {
      type: mongoose.Types.ObjectId,
      ref: "players", //clé étrangère de la collection players
    },
  ],
  characters: {
    type: [
      {
        type: mongoose.Types.ObjectId,
        ref: "characters", //clé étrangère de la collection characters
      },
    ],
    default: [],
  },
  nbRound: { type: Number },
  questions: [
    {
      type: mongoose.Types.ObjectId,
      ref: "questions", //clé étrangère de la collection questions
    },
  ],
});

module.exports = mongoose.models.games || mongoose.model("games", gameSchema); //si collection existe déjà il l'utilise sinon il la recréée
