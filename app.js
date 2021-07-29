const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const indexRouter = require("./routes/index");

const app = express();

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api", indexRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

module.exports = app;
