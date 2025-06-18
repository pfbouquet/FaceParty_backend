// Fonctions servants à créer les questions

const fs = require("fs");
const Game = require("../database/models/Games");
const Question = require("../database/models/Questions");
const { getMorph } = require("./getMorph");

// fonction permettant de charger les données de MongoDB + supprime les anciennes questions de la partie + check noms uniques et présence des portrait
async function checkAndPrepareGameData(roomID) {
  console.log("handleStartGame called with roomID:", roomID);
  // get game data
  let game = await Game.findOne({ roomID: roomID }).populate([
    "players",
    "characters",
  ]);
  if (!game) throw new Error("Game not found");

  // Clean DB from old questions
  game.questions = [];
  await game.save();
  await Question.deleteMany({ gameID: game._id });

  // 0) Prepare data
  let participants = [
    ...game.players.map((el) => ({
      name: el.playerName,
      portraitURI: `./tmp/${el.portraitFilePath}`,
    })),
    ...game.characters.map((el) => ({
      name: el.name,
      portraitURI: `./public/characters/${el.portraitFilePath}`,
    })),
  ];

  // 1) Check if names are unique
  if (new Set(participants.map((p) => p.name)).size !== participants.length) {
    throw new Error(
      "Player names and Characters names are not unique: " +
        participants.map((p) => p.name).join(", ")
    );
  }

  // 2) Check that all player portraits are present
  for (let p of participants) {
    if (!fs.existsSync(p.portraitURI)) {
      throw new Error(
        `Portrait file not found for ${p.name} at ${p.portraitURI}`
      );
    }
  }

  return {
    nbRound: game.nbRound,
    gameID: game._id,
    participants: participants,
  };
}

// générateur de paires uniques
function getUniquePairs(participants) {
  let pairs = [];
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      pairs.push([participants[i], participants[j]]);
    }
  }
  return pairs;
}

// Envoie les questions et leurs réponses en BDD + ajoute ID des questions en clés étrangères dans la collection games
async function pushQuestionToDB(question) {
  // push question to DB
  const newQuestion = new Question(question);
  let questionData = await newQuestion.save();
  if (!questionData) {
    return { result: false, error: "Error while saving question" };
  }
  // add question to game
  let gameData = await Game.findById(question.gameID);
  gameData.questions.push(questionData._id);
  let updateGameData = await gameData.save();
  if (!updateGameData) {
    return {
      result: false,
      error: `Error while adding question ${questionData._id} to game ${question.gameID}`,
    };
  }

  return { result: true, question: questionData };
}

// Créé les questions avec les pairs uniques à mixer et les réponses et appel API Morpher
async function initQuestions(game) {
  let questions = [];

  // Prepare combinaisons
  const combinations = getUniquePairs(game.participants);
  const selectedCombinations = [...combinations]
    .sort(() => 0.5 - Math.random())
    .slice(0, game.nbRound);

  // Prepare questions
  let names = game.participants.map((p) => p.name);

  for (let i = 0; i < selectedCombinations.length; i++) {
    let [p1, p2] = selectedCombinations[i];
    // prepare answers randomly for 2/4
    const goodAnswers = [p1.name, p2.name];
    const possibleAnswers = names
      .filter((n) => !goodAnswers.includes(n))
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    // get morph to morpher
    const morphData = await getMorph(p1.portraitURI, p2.portraitURI);
    // Handle morph errors
    if (!morphData || morphData.result === false || !morphData.morph_url) {
      // if your getMorph returns { result:false, error: "..." }
      throw new Error(morphData.error || "getMorph reported failure");
    }

    // finalise question data
    questions.push({
      gameID: game.gameID,
      index: i,
      type: "morph",
      imageURL: morphData.morph_url,
      goodAnswers: goodAnswers,
      possibleAnswers: [...goodAnswers, ...possibleAnswers].sort( // mélange les 4 réponses possibles pour leur affichage dans le quiz
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

// fonction principale appelant les autres fonctions ci-dessus
async function handleStartGame(roomID) {
  try {
    // Get and check game
    const gameData = await checkAndPrepareGameData(roomID);

    // Prepare and push unique questions
    const questions = await initQuestions(gameData);

    return { result: true, questions: questions };
  } catch (err) {
    console.error("handleStartGame error:", err);
    return { result: false, error: err.message };
  }
}

module.exports = {
  handleStartGame,
};
