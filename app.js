require("dotenv").config();
require("./database/connection");

const express = require("express");
const path = require("path"); //module node pour fournir des chemins sûres pour les fichiers
const cookieParser = require("cookie-parser"); //utilisé pour la persistance/les sessions
const logger = require("morgan"); //module pour débugger
const cors = require("cors"); //module sécurité
const expressFileUpload = require("express-fileupload"); //module pour envoi de fichier

const app = express();

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(expressFileUpload());

// Routes
const playersRouter = require("./routes/players");
const gamesRouter = require("./routes/games");
const portraitsRouter = require("./routes/portrait");
const testsRouter = require("./routes/tests");
const charactersRouter = require("./routes/characters");

app.use("/players", playersRouter);
app.use("/games", gamesRouter);
app.use("/portrait", portraitsRouter);
app.use("/tests", testsRouter);
app.use("/characters", charactersRouter);

module.exports = app;
