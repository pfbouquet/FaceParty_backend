const fs = require("fs");
const Game = require("../database/models/Games");
const Question = require("../database/models/Questions");
const { getMorph } = require("./getMorph");

async function checkGameHealth(roomID) {
  console.log("handleStartGame called with roomID:", roomID);
  // get game data
  const game = await Game.findOne({ roomID: roomID }).populate("players");
  if (!game) {
    return { result: false, error: "Game not found" };
  }

  // check game players consistency
  // 1. check that all player have a name
  game.players.forEach((player) => {
    if (!player.name) {
      return { result: false, error: "Player name is missing" };
    }
  });
  // 2. check that all playernames are unique
  const playerNames = game.players.map((p) =>
    p.playerName.trim().toUpperCase()
  );
  const uniquePlayerNames = new Set(playerNames);
  if (uniquePlayerNames.size !== playerNames.length) {
    return {
      result: false,
      error: "Player names are not unique",
      playerNames: playerNames,
    };
  }
  // 3. check that all player portraits are present
  game.players.map((p) => {
    // do we have the portraitFilePath ?
    if (!p.portraitFilePath) {
      return {
        result: false,
        error: `Player avatar is missing for player ${p.playerName}. Please take another portrait.`,
      };
    }
    // do we have the file ?
    if (!fs.existsSync(p.portraitFilePath)) {
      return {
        result: false,
        error: `File is missing for player ${p.playerName}. Please take another portrait.`,
      };
    }
  });
  return game;
}

function getUniquePairs(players) {
  let pairs = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      pairs.push([players[i], players[j]]);
    }
  }
  return pairs;
}

async function pushQuestionToDB(question) {
  // push question to DB
  const newQuestion = new Question(question);
  let questionData = await newQuestion.save();
  if (!questionData) {
    return { result: false, error: "Error while saving question" };
  }
  // add question to game
  let gameData = await Game.findById(question.gameId);
  gameData.questions.push(questionData._id);
  let updateGameData = await gameData.save();
  if (!updateGameData) {
    return {
      result: false,
      error: `Error while adding question ${questionData._id} to game ${question.gameId}`,
    };
  }

  return { result: true, question: questionData };
}

async function initQuestions(game) {
  // Prepare combinaisons
  const combinations = getUniquePairs(game.players);
  const selectedCombinations = [...combinations]
    .sort(() => 0.5 - Math.random())
    .slice(0, game.nbRound);

  // Prepare questions
  let playerNames = game.players.map((p) => p.playerName);
  let questions = [];
  for (let i = 0; i < selectedCombinations.length; i++) {
    let [p1, p2] = selectedCombinations[i];
    // prepare answers
    const goodAnswers = [p1.playerName, p2.playerName];
    const possibleAnswers = playerNames
      .filter((n) => !goodAnswers.includes(n))
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    // get morph
    const morphURL = await getMorphURL(
      p1.portraitFilePath,
      p2.portraitFilePath
    );

    // finalise question data
    questions.push({
      gameId: game._id,
      index: i,
      type: "morph",
      imageURL: morphURL,
      goodAnswers: goodAnswers,
      possibleAnswers: [...goodAnswers, ...possibleAnswers].sort(
        () => 0.5 - Math.random()
      ),
    });
  }

  // save questions to DB
  for (let question of questions) {
    let dbPush = await pushQuestionToDB(question);
    if (!dbPush.result) {
      return dbPush;
    }
  }

  return questions;
}

async function getMorphURL(p1PortraitFilePath, p2PortraitFilePath) {
  // get morph
  let morphData = await getMorph(
    `./tmp/${p1PortraitFilePath}`,
    `./tmp/${p2PortraitFilePath}`
  );
  // handle errors
  if (!morphData) {
    return {
      result: false,
      error: "No data; Problem uncontered",
      morphResult: morphData,
    };
  }
  if (!morphData.result) {
    return morphData;
  }
  return morphData.morph_url;
}

async function handleStartGame(roomID) {
  // Get and check game
  const gameData = await checkGameHealth(roomID);

  // Clean out old questions
  let questionCleaning = await Question.deleteMany({ gameId: gameData._id });
  gameData.questions = [];
  await gameData.save();

  // Prepare and push unique questions
  await initQuestions(gameData);

  return true;
}

module.exports = {
  handleStartGame,
};
