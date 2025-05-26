const { handleStartGame } = require("../services/gameService.js");

const sockets = async (io, socket) => {
  ////////////////////////////////////////////////////////
  ////////////////////  lobby events   ///////////////////
  ////////////////////////////////////////////////////////

  socket.on("playerUpdate", (roomID) => {
    setTimeout(() => {
      io.to(roomID).emit("playerUpdate");
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
      let questions = await handleStartGame(roomID);
      // Communicate that the game is ready, sending the first question
      if (questions) {
        io.to(roomID).emit("game-cycle", {
          type: "next-question",
          payload: questions[0],
        });
      }
    }, 500);
  });

  //lancement de la question à la fin du countdown
  socket.on("end-ready-for-question-countdown", (roomID) => {
    setTimeout(() => {
      io.to(roomID).emit("game-cycle", {
        type: "go-question",
      });
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
          goodAnswer: ["Allan", "Pierre-François"],
          possibleAnswers: [
            ["Allan", "Marc", "José"],
            ["Titi", "Jean-Claude", "Pierre-François"],
          ],
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
