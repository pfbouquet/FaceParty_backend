require("dotenv").config();
require("./database/connection");

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const expressFileUpload = require("express-fileupload");

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
const indexRouter = require("./routes/index");
const questionsRouter = require("./routes/questions");
const playersRouter = require("./routes/players");
const gamesRouter = require("./routes/games");
const selfiesRouter = require("./routes/selfie");
const testsRouter = require("./routes/tests");
const charactersRouter = require("./routes/characters");

app.use("/", indexRouter);
app.use("/questions", questionsRouter);
app.use("/players", playersRouter);
app.use("/games", gamesRouter);
app.use("/selfie", selfiesRouter);
app.use("/tests", testsRouter);
app.use("/characters", charactersRouter);

module.exports = app;
