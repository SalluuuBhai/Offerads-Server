require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const crypto = require('crypto');

var app = express();
var cors = require('cors');

var dbUrl = require('./common/dbConfig');
// mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var offersRouter = require('./routes/offers');
var customerRouter = require('./routes/customer');

const { UserModel } = require('./schemas/userSchema');
// const { OffersPostModel } = require('./schemas/offersPostSchema');




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/offers', offersRouter);
app.use('/customer', customerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
