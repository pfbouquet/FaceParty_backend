const { handleStartGame } = require("../services/gameService.js");
const Game = require("../database/models/Games");
const Question = require("../database/models/Questions");

const sendQuestion = async (io, roomID, questionIndex) => {
  let gameData = await Game.findOne({ roomID: roomID });

  let questionData = await Question.findOne({
    gameId: gameData._id,
    index: questionIndex,
  });
  // send next question to all players
  io.to(roomID).emit("game-cycle", {
    type: "next-question",
    payload: questionData,
  });
};

const sockets = async (io, socket) => {
  ////////////////////////////////////////////////////////
  ////////////////////  lobby events   ///////////////////
  ////////////////////////////////////////////////////////

  socket.on("player-update", (roomID) => {
    setTimeout(() => {
      io.to(roomID).emit("player-update");
    }, 500);
  });

  ////////////////////////////////////////////////////////
  //////////////////  game-cycle phase   /////////////////
  ////////////////////////////////////////////////////////

  // lancement de la partie par l'admin
  socket.on("start-game", (roomID) => {
    setTimeout(async () => {
      // Communicate entry in game preparation
      io.to(roomID).emit("game-preparation");
      // Prepare the game
      await handleStartGame(roomID);
      // Communicate that the game is ready, sending the first question
      sendQuestion(io, roomID, 0);
    }, 500);
  });

  // passage d'un écran Question à un écran ScroeBoard par l'admin
  socket.on("game-cycle", (data) => {
    setTimeout(() => {
      if (data.type == "go-scoreboard") {
        io.to(data.roomID).emit("game-cycle", { type: "go-scoreboard" });
      } /* passage d'un écran Question à un écran ScroeBoard par l'admin*/
      if (data.type == "go-startsound") {
        io.to(data.roomID).emit("game-cycle", { type: "go-startsound" });
      } /* passage d'un écran Question à un écran ScroeBoard par l'admin*/
      if (data.type == "go-question") {
        io.to(data.roomID).emit("game-cycle", {
          type: "go-question",
        }); //lancement de la question à la fin du countdown
      }
      if (data.type == "get-next-question") {
        sendQuestion(io, data.roomID, data.currentQuestionIndex + 1);
      }
      if (data.type == "to-the-lobby") {
        io.to(data.roomID).emit("game-cycle", { type: "to-the-lobby" });
      }
      if (data.type == "to-podium") {
        io.to(data.roomID).emit("game-cycle", { type: "to-podium" });
      }
    }, 500);
  });

  ////////////////////////////////////////////////////////
  //////////////////////   TESTS   ///////////////////////
  ////////////////////////////////////////////////////////

  // question en dur qui sera remplacé plus tard
  socket.on("question", (data) => {
    setTimeout(() => {
      io.emit("questionText", data);
    }, 500);
  });

  // socket permettant de stocker en dur une question test
  socket.on("get-question", (roomID) => {
    setTimeout(() => {
      io.to(roomID).emit("questionText", {
        type: "question",
        payload: {
          questionID: "123456789",
          imageURL:
            "https://res.cloudinary.com/dat8yzztd/image/upload/v1747919107/picture1_ybfkmw.png",
          goodAnswers: ["Allan", "Pierre-François"],
          possibleAnswers: ["Allan", "Marc", "José", "Pierre-François"],
          index: 2,
          askedAtTime: Date.now(),
          answerHistory: [
            {
              playerID: "P1",
              answer: ["José", "Titi"],
              answeredAtTime: Date.now(),
            },
          ],
        },
      });
    }, 500);
  });
};

module.exports = sockets;
