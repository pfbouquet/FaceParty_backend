const { handleStartGame } = require("../services/gameService.js"); // logique de préparation de la partie
const Game = require("../database/models/Games");
const Question = require("../database/models/Questions");

// Envoie une question spécifique à tous les joueurs d'une room
const sendQuestion = async (io, roomID, questionIndex) => {
  let gameData = await Game.findOne({ roomID: roomID });

  let questionData = await Question.findOne({
    gameID: gameData._id,
    index: questionIndex,
  });
  // send next question to all players
  io.to(roomID).emit("game-cycle", {
    type: "next-question",
    payload: questionData,
  });
};

// Logique principale de gestion des sockets
const sockets = async (io, socket) => {
  ////////////////////////////////////////////////////////
  ////////////////////  lobby events   ///////////////////
  ////////////////////////////////////////////////////////

  // Mise à jour des joueurs dans le lobby
  socket.on("player-update", (roomID) => {
    setTimeout(() => { // léger délai pour s'assurer que la mise à jour côté DB est faite
      io.to(roomID).emit("player-update");
    }, 500);
  });

  ////////////////////////////////////////////////////////
  //////////////////  game-cycle phase   /////////////////
  ////////////////////////////////////////////////////////

  // lancement de la partie par l'admin
  socket.on("start-game", (roomID) => {
    setTimeout(async () => {
      // Informer tous les joueurs que la préparation du jeu commence
      io.to(roomID).emit("game-preparation");
      // Appelle le service (du dossier "services") qui vérifie et prépare les questions de la partie
      await handleStartGame(roomID);
      // Indique que la partie est prête et envoie la 1ère question
      sendQuestion(io, roomID, 0);
    }, 500);
  });

  // Gestion du cycle de jeu (navigation entre les écrans)
  socket.on("game-cycle", (data) => {
    setTimeout(() => {
      // Aller vers l'écran des scores
      if (data.type == "go-scoreboard") {
        io.to(data.roomID).emit("game-cycle", { type: "go-scoreboard" });
      }
      // Aller vers l'écran question à la fin du countdown
      if (data.type == "go-question") {
        io.to(data.roomID).emit("game-cycle", {
          type: "go-question",
        });
      }
      // Appelle la question suivante en récupérant la question à l'index+1
      if (data.type == "get-next-question") {
        sendQuestion(io, data.roomID, data.currentQuestionIndex + 1);
      }
      // Retourner tous les joueurs au lobby
      if (data.type == "to-the-lobby") {
        io.to(data.roomID).emit("game-cycle", { type: "to-the-lobby" });
      }
      // Passer à l'écran de podium (fin de partie)
      if (data.type == "to-podium") {
        io.to(data.roomID).emit("game-cycle", { type: "to-podium" });
      }
    }, 500);
  });
};

module.exports = sockets;
