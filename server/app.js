require("dotenv").config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
const postApiRouter = require("./routes/postApi")
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, DB_URL } = process.env
var app = express();

// google drive api setup
const { google } = require("googleapis")
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })
const drive = google.drive({
  version: "v3",
  auth: oAuth2Client
})

// database setup
const mongoose = require("mongoose")
mongoose.connect(DB_URL, {
  useNewUrlParser: true, useUnifiedTopology: true,
  useCreateIndex: true, useFindAndModify: false
}).then(() => console.log("database connected"))
  .catch((err) => console.log(err));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS")
  next()
})

app.use('/', indexRouter);
app.use("/postApi", (req, res, next) => { req.drive = drive; req.files = []; next() }, postApiRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;